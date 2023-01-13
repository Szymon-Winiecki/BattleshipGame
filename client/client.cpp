#include "client.h"





int main(int argc, char ** argv){

    if(argc!=3) error(1,0,"Need 2 args");
	
	// Resolve arguments to IPv4 address with a port number
	addrinfo *resolved, hints={.ai_flags=0, .ai_family=AF_INET, .ai_socktype=SOCK_STREAM};
	int res = getaddrinfo(argv[1], argv[2], &hints, &resolved);
	if(res || !resolved) error(1, 0, "getaddrinfo: %s", gai_strerror(res));
	
	// create socket
	int sock = socket(resolved->ai_family, resolved->ai_socktype, 0);
	if(sock == -1) error(1, errno, "socket failed");
	
	// attept to connect
	res = connect(sock, resolved->ai_addr, resolved->ai_addrlen);
	if(res) error(1, errno, "connect failed");
	
	// free memory
	freeaddrinfo(resolved);


    int fd = epoll_create1(0);

    epoll_event ev;

    ev.events = EPOLLIN;
    ev.data.u64 = 123;
    epoll_ctl(fd,EPOLL_CTL_ADD,sock,&ev);
    ev.data.fd = 0;
    epoll_ctl(fd,EPOLL_CTL_ADD,0,&ev);
    /*NA RAZIE WSZYSTKO DZIALA PRZEZ WPISYWANIE W KONSOLE ZEBY LATWO BYLO TESTOWAC*/
    printf( "Akcje:\n"
            "1 - stworz gre\n"
            "2 <id_gry>- dolacz do gry np. 2 game1\n"
            "3 - wyjdz z gry\n"
            "4 <id_druzyny> - zmien druzyne np 4 0 lub 4 1 bo mamy tylko dwie druzyny\n"
            "5 <id_druzyny> - wyswietl mape druzyny\n"); //TESTOWE do usuniecia
    while(1){
        int ew = epoll_wait(fd,&ev,1,-1);

        if(ev.events & EPOLLIN && ev.data.u64==123){
            ssize_t bufsize1 = 255, received1;
            char buffer1[bufsize1];
            received1 = readDatarec(sock, buffer1, bufsize1);
            if(buffer1[0] == '0'){ //TESTOWE gdy wylaczymy serwer recznie zeby od razu rozlaczylo klientow- do usuniecia, dodac moze rodzaj errora do message servererror czy cos i wtedy disconnect
                printf("Serwer nie odpowiada.\n");
                break;
            }

        }
        
        if(ev.events & EPOLLIN && ev.data.u64==0){
            ssize_t bufsize2 = 255, received2;
            char buffer2[255]{};
            received2 = readData(0, buffer2, bufsize2);
            if(buffer2[0]=='1'){
                Message* message = new Message(CREATE,"");
                writeDatam(sock,message);
            }
            else if(buffer2[0]=='2'){
                std::string s{buffer2};
                s=s.substr(2,s.size()-2-1);
                Message* message = new Message(JOIN,s,"","");
                writeDatam(sock,message);
            }
            else if(buffer2[0]=='3'){
                Message* message = new Message(LEAVE);
                writeDatam(sock,message);
            }
            else if(buffer2[0]=='4'){
                std::string s{buffer2};
                s=s.substr(2,s.size()-2-1);
                Message* message = new Message(CHANGETEAM,s);
                writeDatam(sock,message);
            }
            else if(buffer2[0]=='5'){
                std::string s{buffer2};
                s=s.substr(2,s.size()-2-1);
                Message* message = new Message(GETMAP,s);
                writeDatam(sock,message);
            }
        }
        if(ev.events & ~EPOLLIN){
            printf("Serwer nie odpowiada.\n");
            break;
        }
    }

    close(sock);
    close(fd);


    return 0;
}


ssize_t readDatarec(int fd, char * buffer, ssize_t buffsize){
	auto ret = read(fd, buffer, buffsize);
	if(ret==-1) error(1,errno, "read failed on descriptor %d", fd);
    else{
        std::string s {buffer};
        Message message;
        message=message.decode(s);
        switch(message.getType()){ //testowanie do zmiany potem, na razie wypisuje tylko na konsole informacje od serwra ze operacja sie udala, albo ze nie
            case INFO: //info o dolaczeniu do serwera
                writeDatatoConsole(1, message.getParam1().c_str(), message.getParam1().size());
            break;
            case ERROR: //gdy cos sie nie uda
                writeDatatoConsole(1, message.getParam1().c_str(), message.getParam1().size());
            break;
            case CREATE: //stworzenie gry
                writeDatatoConsole(1, message.getParam1().c_str(), message.getParam1().size());
            break;
            case JOIN: //dolaczenie do gry
                writeDatatoConsole(1, message.getParam1().c_str(), message.getParam1().size());
            break;
            case SHOWTEAMS: //DO POPRAWY
                //std::cout<<message.getPlayerId()<<" "<<message.getContent()<<std::endl;
                //writeData1(1, message.getPlayerId().c_str(), message.getPlayerId().size());
                //writeData1(1, message.getContent().c_str(), message.getContent().size());
            break;
            case LEAVE: //wyjscie z gry
                writeDatatoConsole(1, message.getParam1().c_str(), message.getParam1().size());
            break;
            case GETMAP: //dolaczenie do gry
                writeDatatoConsole(1, message.getParam1().c_str(), message.getParam1().size());
            break;
            default:
            break;
        }
    }
	return ret;
}

void writeData(int fd, char * buffer, ssize_t count){
	auto ret = write(fd, buffer, count);
	if(ret==-1) error(1, errno, "write failed on descriptor %d", fd);
	if(ret!=count) error(0, errno, "wrote less than requested to descriptor %d (%d/%ld)", fd, count, ret);
}




void writeDatatoConsole(int fd, std::string buffer, ssize_t count){
    buffer+='\n';
    count++;
	auto ret = write(fd, buffer.c_str(), count);
	if(ret==-1) error(1, errno, "write failed on descriptor %d", fd);
	if(ret!=count) error(0, errno, "wrote less than requested to descriptor %d (%d/%ld)", fd, count, ret);
}




void writeDatam(int fd, Message* message){
    int count = message->getLength();
	auto ret = write(fd, message->encode().c_str(), count);
	if(ret==-1) error(1, errno, "write failed on descriptor %d", fd);
	if(ret!=count) error(0, errno, "wrote less than requested to descriptor %d (%d/%ld)", fd, count, ret);
}
ssize_t readData(int fd, char * buffer, ssize_t buffsize){
	auto ret = read(fd, buffer, buffsize);
	if(ret==-1) error(1,errno, "read failed on descriptor %d", fd);
	return ret;
}