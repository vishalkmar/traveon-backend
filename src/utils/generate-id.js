/// Generate ID

// ============>Genrate User Id Function<=============
export default function generateID(prefix) {
  return (
    prefix +
    new Date().getFullYear().toString().substr(-2) +
    Math.floor(Math.random() * 90000)
  );
}

// ============>Genrate Referral Code Function<=============
export function generateReferralCodeFunction(name) {
  // Extract the first 3 letters or pad with '0' if less than 3 characters
  const namePart = name.substring(0, 3).toUpperCase().padEnd(3, '0');
  
  // Generate a random 3-digit number
  const randomNumber = Math.floor(100 + Math.random() * 900); // ensures a 3-digit number

  // Combine the name part with the random number
  const referralId = namePart + randomNumber;

  return referralId;
}