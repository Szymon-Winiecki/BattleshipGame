

const MessageType = {
  UNKNOWN: 0,
  INFO: 1,
  ERROR: 2,
  VOTE: 3,
  JOIN: 4,
  CREATE: 5,
  PLAYERJOINED: 6,
  PLAYERLEFT: 7,
  SHOWTEAMS: 8,
  LEAVE: 9,
  CHANGETEAM: 10,
  GETMAP: 11,
  SERVERERROR: 12,
  PLAYERERROR: 13,
  SENDFD: 14,
  VOTERESULT: 15,
  NEXTROUND: 16,
  UPDATEMAP: 17,
  GETROUND: 18
};


class Message {
    #type;
    #objectId;
    #param1;
    #param2;

    constructor(type, gameId, param1, param2) {
      this.#type = type || MessageType.UNKNOWN;
      this.#objectId = gameId || "";
      this.#param1 = param1 || "";
      this.#param2 = param2 || "";
    }
  
    static decode(message, separator = '|') {
      let decoded = new Message();
      let encoded = message.split(separator);
      decoded.#type = encoded[0];
      decoded.#objectId = encoded[1] || "";
      decoded.#param1 = encoded[2] || "";
      decoded.#param2 = encoded[3] || "";
      return decoded;
    }
  
    encode(separator = '|') {
      return `{${this.#type}${separator}${this.#objectId}${separator}${this.#param1}${separator}${this.#param2}}`;
    }
  
    getType() {
      return parseInt(this.#type);
    }
  
    getObjectId() {
      return this.#objectId;
    }
  
    getParam1() {
      return this.#param1;
    }
  
    getParam2() {
      return this.#param2;
    }
  
    getLength() {
      return this.encode().length;
    }
  };
  

  module.exports = {
    Message,
    MessageType
  }