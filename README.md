# FairShare Calc

[cloudflarebutton]

A simple web application to calculate per-item food prices after applying a proportional discount with a maximum cap, similar to food delivery app vouchers.

FairShare Calc is a minimalist, single-page web application designed to help users proportionally distribute a total discount across a list of food items. Users input a discount percentage and a maximum discount value, then list their food items with price and quantity. The application instantly calculates the total gross price, determines the actual discount applied (respecting the cap), and then allocates this discount proportionally to each item based on its contribution to the total cost.

## Key Features

-   **Proportional Discount Calculation**: Fairly distributes a total discount across multiple items based on their value.
-   **Flexible Discount Rules**: Supports percentage-based discounts with a configurable maximum cap.
-   **Dynamic Item List**: Easily add or remove food items to the calculation list.
-   **Real-Time Updates**: All calculations update instantly as you type, providing immediate feedback.
-   **Detailed Breakdown**: View the original price, discount applied, and final price for each individual item.
-   **Clear Summary**: Get a clean overview of the total cost before discount, total savings, and the final amount payable.
-   **Responsive Design**: A clean, modern, and fully responsive interface that works beautifully on any device.

## Technology Stack

-   **Framework**: React (Vite)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS with shadcn/ui components
-   **State Management**: Zustand
-   **Animations**: Framer Motion
-   **Icons**: Lucide React
-   **Deployment**: Cloudflare Workers

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Bun](https://bun.sh/) installed on your machine.
-   [Git](https://git-scm.com/) for cloning the repository.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/fairshare-calc.git
    cd fairshare-calc
    ```

2.  **Install dependencies:**
    The project uses Bun for package management.
    ```sh
    bun install
    ```

3.  **Run the development server:**
    This command starts the Vite development server.
    ```sh
    bun run dev
    ```
    The application will be available at `http://localhost:3000`.

## Usage

The application is designed to be intuitive and straightforward:

1.  **Set Discount Rules**: In the "Configuration" section, enter the discount percentage (e.g., `50`) and the maximum possible discount amount in Rupiah (e.g., `200000`).
2.  **Add Items**: In the "Food Items" section, fill in the details for each item:
    -   Item Name
    -   Price per portion
    -   Quantity
3.  **Add More Items**: Click the "Add Item" button to add a new row to the list.
4.  **View Results**: The "Results" table will automatically update, showing a detailed breakdown for each item, including the discount allocated and the final price.
5.  **Check Summary**: The "Summary" section at the bottom provides the grand totals for your entire order.

## Development Scripts

-   `bun run dev`: Starts the local development server.
-   `bun run build`: Creates a production-ready build of the application.
-   `bun run lint`: Lints the codebase to check for errors and style issues.
-   `bun run deploy`: Deploys the application to Cloudflare Workers.

## Deployment

This project is configured for easy deployment to Cloudflare Pages/Workers.

To deploy your own version, simply click the button below or run the deploy command after setting up your Cloudflare account and Wrangler.

[cloudflarebutton]

Alternatively, you can deploy manually from the command line:

1.  **Login to Cloudflare:**
    ```sh
    npx wrangler login
    ```

2.  **Run the deploy script:**
    ```sh
    bun run deploy
    ```
    This will build the application and deploy it using the configuration in `wrangler.jsonc`.

## License

This project is licensed under the MIT License.