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

    printf("Akcje:\n1 - stworz gre\n2 <id_gry>- dolacz do gry\n");
    while(1){
        int ew = epoll_wait(fd,&ev,1,-1);

        if(ev.events & EPOLLIN && ev.data.u64==123){
            ssize_t bufsize1 = 255, received1;
            char buffer1[bufsize1];
            received1 = readData(sock, buffer1, bufsize1);
            if(buffer1[0] == '0'){
                printf("Serwer nie odpowiada.\n");
                break;
            }
            writeData(1, buffer1, received1);

        }

        if(ev.events & EPOLLIN && ev.data.u64==0){
            ssize_t bufsize2 = 255, received2;
            char buffer2[bufsize2];
            received2 = readData(0, buffer2, bufsize2);
            writeData(sock, buffer2, received2);
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

ssize_t readData(int fd, char * buffer, ssize_t buffsize){
	auto ret = read(fd, buffer, buffsize);
	if(ret==-1) error(1,errno, "read failed on descriptor %d", fd);
	return ret;
}

void writeData(int fd, char * buffer, ssize_t count){
	auto ret = write(fd, buffer, count);
	if(ret==-1) error(1, errno, "write failed on descriptor %d", fd);
	if(ret!=count) error(0, errno, "wrote less than requested to descriptor %d (%ld/%ld)", fd, count, ret);
}