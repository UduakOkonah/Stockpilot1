const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const connectDB = require("./config/db");
const invoiceRoutes = require("./routes/invoiceRoutes");
const PORT = process.env.PORT || 5000;

console.log("MONGO URI exists:", !!process.env.MONGO_URI);

connectDB();

app.use("/api/invoices", invoiceRoutes);
  
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});