const jwt = require('jsonwebtoken');
const redis = require('redis');

const redisClient = redis.createClient(process.env.REDIS_URI);

const handleSignin = (db, bcrypt, req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return Promise.reject('incorrect form submission');
  }
  return db.select('email', 'hash').from('login')
    .where('email', '=', email)
    .then(data => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db.select('*').from('users')
          .where('email', '=', email)
          .then(user => user[0])
          .catch(err => Promise.reject('unable to get user'))
      } else {
        Promise.reject('wrong credentials')
      }
    })
    .catch(err => Promise.reject('wrong credentials'))
}

getAuthTokenId = (req, res) => {
    const {authorization} = req.headers;
    return redisClient.get(authorization, (err, reply) => {
        if(err || !reply) {
            return res.status(400).json('unauthorised')
        }
        return res.json({ userId: reply})
    })
} 


const signToken = (email) => {
    const jwtPayload = { email }
    return jwt.sign(jwtPayload, 'LAZY_DEVELOPER', { expiresIn: '2 days'});
}

const setToken = (key, value) => {
    return Promise.resolve(redisClient.set(key, value))
}

const createSession = (user) => {
   const { email, id } = user;
   const token = signToken(email); 
   return setToken(token, id)
   .then(() => {return { success: 'true', userId: id, token}} )
   .catch(err => { console.log("error while setting in redis", err)})
} 

const signInAuthentication = (db, bcrypt) => (req, res) => {
    const { authorization } = req.headers;
    return authorization ? getAuthTokenId(req, res) : 
        handleSignin(db, bcrypt, req, res)
            .then(data => {
               return data.id && data.email ? createSession(data) : Promise.reject(data) 
            })
            .then(session => res.json(session))
            .catch(err => res.status(400).json(err))
}

module.exports = {
    signInAuthentication: signInAuthentication,
    redisClient
}