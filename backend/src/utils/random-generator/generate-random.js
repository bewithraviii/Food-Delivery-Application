const { v4: uuidv4 } = require('uuid');

const generateRandomFourDigitNumber = async() => {
    
    try{
        const uuid = uuidv4();
        const digits = uuid.replace(/\D/g, '');
      

        if (digits.length < 4) {
          return String(Math.floor(1000 + Math.random() * 9000));
        }

        return digits.slice(0, 4);
        
    } catch(error){
        console.error("Error generating random int:", error);
        return null;
    }
    
}


module.exports = generateRandomFourDigitNumber;