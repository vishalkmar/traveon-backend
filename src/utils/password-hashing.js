import bcrypt from 'bcrypt';

class PasswordHashing{
    
    hash(password){
        return new Promise(( resolve, reject )=>{
            this.generateSalt(async function(err, salt){
                    if(err){
                     reject(err.message)
                    } else {
                        try {
                            let hashPassword = await bcrypt.hash(password, salt);
                            resolve(hashPassword)
                        } catch (error) {
                            reject(error.message)
                        }
                }
            });
        })
    }

    generateSalt = function(callback){
        // do not change the salt, it should always be 10
        bcrypt.genSalt(10, callback);
    }

    comparePassword =async function(password, dbpassword, callback = undefined){
       return  bcrypt.compare(password, dbpassword, callback);
    }
}

export default new PasswordHashing();