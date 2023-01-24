
class Board{

    static FieldStatus = {
        CLEAR: 0,  // pole puste lub status nieznany
        SHIP: 1,   //nieuszkodzony statek
        MISS: 2,   //pudlo
        HIT: 3,    //trafiony statek
        SUNK: 4,   //zatopiony statek
        INVALID_FIELD: 5   //nieprawidlowe pole
    };

    static decode(encodedMap, separator = '&'){
        const separatorIndex = encodedMap.indexOf(separator);
        const size = parseInt(encodedMap.substring(0, separatorIndex));
        encodedMap = encodedMap.substring(separatorIndex + 1);

        let fields = new Array(size);
        for(let i = 0; i < size; ++i){
            fields[i] = new Array(size);
        }

        for(let i = 0; i < size; ++i){
            for(let j = 0; j < size; ++j){
                fields[i][j] = parseInt(encodedMap[size * j + i]);
            }
        }

        return new Board(fields);
    }

    #fields;
    #size;

    constructor(fields = [[]]){
        this.#size = fields.length;
        this.#fields = fields;
    }

    getSize(){
        return this.#size;
    }

    getStatus(x, y){
        return this.#fields[x][y];
    }

    changeStatus(x, y, newStatus){
        this.#fields[x][y] = newStatus;
    }
}


module.exports = Board;