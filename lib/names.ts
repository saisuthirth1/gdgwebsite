// Array of common Indian names for mock data
export const indianNames = [
  "Aarav Kumar",
  "Aditi Sharma",
  "Arjun Patel",
  "Diya Singh",
  "Ishaan Mehta",
  "Kavya Reddy",
  "Krishna Iyer",
  "Meera Gupta",
  "Neha Verma",
  "Nikhil Shah",
  "Priya Malhotra",
  "Rahul Kapoor",
  "Riya Desai",
  "Rohan Joshi",
  "Samarth Rao",
  "Sanvi Mishra",
  "Shivani Choudhury",
  "Tanvi Nair",
  "Vihaan Srinivasan",
  "Zara Khan"
];

// Function to get a random name from the array
export function getRandomName(): string {
  const randomIndex = Math.floor(Math.random() * indianNames.length);
  return indianNames[randomIndex];
}