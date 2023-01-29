#include <cstdlib>
#include <time.h>

#include "../include/Server.h"

int main(int argc, char ** argv){

    srand(time(0));

    Server server = Server();
    server.run(argc, argv);

    return 0;
}
