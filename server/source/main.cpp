
#include "../include/Server.h"

int main(int argc, char ** argv){

    Server server = Server();
    server.run(argc, argv);

    return 0;
}
