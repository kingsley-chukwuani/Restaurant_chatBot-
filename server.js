const express = require("express");
const app = express();
const PORT = 8000;
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const cron = require("node-cron");

const orders = [];
let awaitingOrders = [];

const items = [
  { id: "1", name: "Grilled Turkey", price: 4000 },
  { id: "2", name: "Fanta", price: 200 },
  { id: "3", name: "Fried Rice", price: 2000 },
  { id: "4", name: "Plantain", price: 320 },
  { id: "5", name: "Pounded yam", price: 900 },
  { id: "6", name: "Egusi soup", price: 500 },
  { id: "7", name: "Salad", price: 300 },
  { id: "8", name: "Abacha", price: 800 },
  { id: "9", name: "Jollof Rice", price: 1200 },
  { id: "10", name: "Malt", price: 190 },
];

const reOrderMenu = [
  "00 to go to the main menu",
  "0 to cancel order",
  "1 to place a new order",
  "99 to checkout the order",
];

const getMainMenuMessage = () => {
  return options
    .map((option) => {
      return `Select ${option.value} to ${option.description}`;
    })
    .join("\n");
};

const sendTimeoutMessage = (fn) => {
  setTimeout(() => {
    fn();
  }, 500);
};

const sortItems = (items) => {
  const arrangedOrders = {};
  items.forEach((item) => {
    if (arrangedOrders[item.name])
      arrangedOrders[item.name] = {
        count: arrangedOrders[item.name].count + 1,
        total: arrangedOrders[item.name].total + item.price,
      };
    else
      arrangedOrders[item.name] = {
        count: 1,
        total: item.price,
      };
  });

  return arrangedOrders;
};

const currentOrder = ({ sessionID }) => {
  const orders = awaitingOrders.find((order) => order.user === sessionID);
  if (!orders) return "You currently have no active order.";

  const arrangedOrders = sortItems(orders.items);

  return Object.keys(arrangedOrders)
    .map(
      (key) =>
        `${key} - ${arrangedOrders[key].count} - $${arrangedOrders[key].total}`
    )
    .join("\n", ",");
};

const placeOrder = () => {
  io.emit("mode", "order");
  return items
    .map((item) => `${item.id} - ${item.name} - $${item.price}`)
    .join("\n", ",");
};

const orderHistory = ({ sessionID }) => {
  return orders
    .filter((item) => item.user === sessionID)
    .map((order) => {
      const date = new Date(order.timestamp);
      const arrangedOrders = sortItems(order.items);
      const items = Object.keys(arrangedOrders)
        .map(
          (key) =>
            `${key} - ${arrangedOrders[key].count} - $${arrangedOrders[key].total}`
        )
        .join("\n");
      return `${date.getDate()}/${
        date.getMonth() + 1
      }/${date.getFullYear()} \n ${items}`;
    })
    .join("\n");
};

const checkoutOrder = ({ sessionID }) => {
  const order = awaitingOrders.find((order) => order.user === sessionID);
  if (order) {
    orders.push({ ...order, timestamp: new Date() });
    awaitingOrders = awaitingOrders.filter((order) => order.user !== sessionID);
    return "Sucessfully completed order.";
  } else return "You have no order to checkout.";
};

const cancelOrder = ({ sessionID }) => {
  const currOrder = awaitingOrders.find((order) => order.user === sessionID);

  if (currOrder) {
    awaitingOrders = awaitingOrders.filter((item) => item.user !== sessionID);
    return "Order cancelled.";
  } else return "No order to cancel.";
};

const options = [
  {
    value: "1",
    description: "Place an order",
    action: placeOrder,
  },
  { value: "97", description: "See current order", action: currentOrder },
  { value: "98", description: "See order history", action: orderHistory },
  { value: "99", description: "Checkout order", action: checkoutOrder },
  { value: "0", description: "Cancel order", action: cancelOrder },
];

const handleMessage = ({ message, sessionID }) => {
  if (message.mode === "menu") {
    const optionExists = options.find(
      (option) => option.value === message.value
    );
    if (!optionExists) return "Invalid option.";
    const data = optionExists.action({ sessionID });
    return data;
  } else if (message.mode === "order") {
    const item = items.find((item) => item.id === message.value);
    if (!item) return "Item not found.";

    const currOrder = awaitingOrders.find((order) => order.user === sessionID);

    if (!currOrder) awaitingOrders.push({ user: sessionID, items: [item] });
    else currOrder.items.push(item);

    io.emit("mode", "re-order");

    sendTimeoutMessage(() => io.emit("message", reOrderMenu.join("\n")));

    return `Added ${item.name} to your order.`;
  } else if (message.mode === "re-order") {
    if (message.value === "99") {
      io.emit("mode", "menu");

      sendTimeoutMessage(() => io.emit("message", getMainMenuMessage()));
      return checkoutOrder({ sessionID });
    } else if (message.value == "1") {
      return placeOrder();
    } else if (message.value == "0") {
      io.emit("mode", "menu");
      sendTimeoutMessage(() => io.emit("message", getMainMenuMessage()));
      return cancelOrder({ sessionID });
    } else if (message.value == "00") {
      io.emit("mode", "menu");
      sendTimeoutMessage(() => io.emit("message", getMainMenuMessage()));
    } else return "Invalid option.";
  }
};

io.on("connection", (socket) => {
  socket.emit("connected", getMainMenuMessage());

  socket.on("message", (message) => {
    socket.emit(
      "message",
      handleMessage({
        message: { value: message.value, mode: message.mode },
        sessionID: message.username,
      })
    );
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public" + "/index.html");
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});

cron.schedule("* * * * *", () => {
  console.log("Clearing all orders that are older than 50 minutes");
  const now = new Date().getTime();
  orders = orders.filter((order) => now - order.timestamp <= 30 * 60 * 1000);
});
