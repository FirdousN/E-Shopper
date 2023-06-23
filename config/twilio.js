// Download the helper library from https://www.twilio.com/docs/node/install
// Set environment variables for your credentials
// Read more at http://twil.io/secure
const accountSid = process.env.accountSid;
const authToken = process.env.authToken;
const verifySid = process.env.verifySid;

const client = require("twilio")(accountSid, authToken);

// client.verify.v2
//   .services(verifySid)
//   .verifications.create({ to: "+917356017317", channel: "sms" })
//   .then((verification) => console.log(verification.status))
//   .then(() => {
//     const readline = require("readline").createInterface({
//       input: process.stdin,
//       output: process.stdout,
//     });
//     readline.question("Please enter the OTP:", (otpCode) => {
//       client.verify.v2
//         .services(verifySid)
//         .verificationChecks.create({ to: "+917356017317", code: otpCode })
//         .then((verification_check) => console.log(verification_check.status))
//         .then(() => readline.close());
//     });
//   });
/////************ */

const rateLimitTime = 20 * 1000; //20 seconds
let lastRequestTime = 0;


const generateOTP = async (phonenumber) => {
/*   const currentTime = Date.now();
  if (currentTime - lastRequestTime < rateLimitTime) {
    console.log("Rat limit exceeded. Please wait before making another request.")
    return;
  }
  lastRequestTime = currentTime; */

/*   const verification = await client.verify.v2
    .services(verifySid)
    .verifications.create({ to: `+91${phonenumber}`, channel: "sms" })
    .then((verification) => {
      console.log(verification.sid)
      return verification
    })
    .catch((error) => {
      console.log(error)
      throw error;
    }); */

  client.verify.v2.services(verifySid)
    .verifications
    .create({ to: `+91${phonenumber}`, channel: 'sms' })
    .then(verification => console.log(verification.sid))
    .catch((error)=>{
      console.log(error.message);
    })
};


module.exports = { generateOTP };
//   export default twilioFunctions;