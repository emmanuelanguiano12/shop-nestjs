import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';

@WebSocketGateway({cors: true})
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server; // Tiene la información de todos los clientes conectados

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    
    try {
      payload = this.jwtService.verify(token)
      await this.messagesWsService.registerClient(client, payload.id)
    } catch (error) {
      client.disconnect();
      return;
    }

    // console.log({payload})

    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients()) // Emitir que hay nuevos clientes

  }

  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id)
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients()) // Emitir que se desconectan clientes

  }

  // message-from-client
  @SubscribeMessage('message-from-client')
  onMessageFromClient(client: Socket, payload: NewMessageDto){

    //! Solo emite al cliente emisor
    // client.emit('message-from-server', {
    //   fullName: 'Soy yo',
    //   message: payload.message || 'No message'
    // })

    //! Emitir a todos menos al emisor
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'Soy yo',
    //   message: payload.message || 'No message'
    // })

    //! Emitir a todos incluido el emisor
    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullNameBySocket(client.id),
      message: payload.message || 'No message'
    })

  }

}
