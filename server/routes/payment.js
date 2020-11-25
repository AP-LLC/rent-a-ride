// router.post("/payment", getBill)
//
// module.exports = router
//
// const getBill = (req, res) => {
//   const { name, userEmail } = req.body;
//
//   let response = {
//     body: {
//       name,
//       intro: "Your bill has arrived!",
//       table: {
//         data: [
//           {
//             item: "MERN stack book",
//             description: "A mern stack book",
//             price: "$10.99",
//           },
//         ],
//       },
//       outro: "Looking forward to do more business with you",
//     },
//   };
//
//   let mail = MailGenerator.generate(response);
//
//   let message = {
//     from: EMAIL,
//     to: userEmail,
//     subject: "transaction",
//     html: mail,
//   };
//
//   transporter
//   .sendMail(message)
//   .then(() => {
//     return res
//     .status(200)
//     .json({ msg: "you should receive an email from us" });
//   })
//   .catch((error) => console.error(error));
// };
//
// module.exports = {
//   getBill,
// };
