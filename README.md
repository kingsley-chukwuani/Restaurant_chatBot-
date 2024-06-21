# RESTAURANT CHAT-BOT

## Description
Restaurant Chat-Bot is a web-based chat application that allows users to interact with a virtual assistant for placing and managing food orders. The application uses Socket.IO for real-time communication between the client and server, and Node.js for server-side processing.

## Features
1. **User Authentication**: Users can enter their username and continue to the chat interface.
2. **Real-Time Messaging**: Users can send and receive messages in real-time.
3. **Order Management**: Users can place new orders, view current orders, see order history, and checkout or cancel orders.
4. **Responsive Design**: The UI is responsive and adjusts to various screen sizes, including tablets and mobile phones.

## Tech Stack
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js, Socket.IO
- **Scheduling**: Node-cron

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/kingsley-chukwuani /Restaurant_chatBot-.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Restaurant_chatBot
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```

## Usage
1. Open your browser and navigate to `https://alexis-cuisine.onrender.com`.
2. Enter your username to start interacting with the virtual assistant.
3. Use the chat interface to place orders and manage them.

## Code Overview

### Frontend (`index.html`)
- The HTML file includes a simple form for entering the username and a chat interface for interacting with the assistant.
- Styles are defined in the `<style>` section for various components to ensure a responsive design.
- JavaScript code is included to handle user interactions, form submissions, and real-time messaging using Socket.IO.

### Backend (`server.js`)
- **Dependencies**: Express, HTTP, Socket.IO, and Node-cron.
- **Data Structures**: `items` array for menu items, `orders` array for storing completed orders, and `awaitingOrders` array for orders in progress.
- **Functions**:
  - `getMainMenuMessage()`: Generates the main menu message.
  - `sendTimeoutMessage(fn)`: Delays the execution of a function.
  - `sortItems(items)`: Sorts and aggregates order items.
  - `currentOrder(sessionID)`: Returns the current order for a user.
  - `placeOrder()`: Initiates a new order.
  - `orderHistory(sessionID)`: Returns the order history for a user.
  - `checkoutOrder(sessionID)`: Completes the checkout process.
  - `cancelOrder(sessionID)`: Cancels an ongoing order.
  - `handleMessage(message, sessionID)`: Processes user messages based on the current mode.

- **Socket.IO Handlers**:
  - Handles user connections and incoming messages.
  - Emits appropriate responses based on user actions and order states.

- **Express Routes**:
  - Serves the static `index.html` file.

- **Cron Job**:
  - Clears orders that are older than 50 minutes every minute.

## Contributing
1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes.
4. Push to your branch.
5. Create a pull request.


## Acknowledgements
- Socket.IO documentation
- Node.js documentation
- Express.js documentation.
