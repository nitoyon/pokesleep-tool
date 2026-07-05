# Calc Tools for Pokémon Sleep

- [IV Calc](https://nitoyon.github.io/pokesleep-tool/iv/)
- [Research Calc](https://nitoyon.github.io/pokesleep-tool/)

Feel free to [contribute](CONTRIBUTING.md)!

## How to build

### Prerequisites

Install Node.js v22.19+.

1. Clone this repository
2. Run `npm install`.
3. Run `npx lefthook install`

### `npm run dev`

Runs the app in the development mode.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `dist` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

### `npm test`

Runs unit tests.

## Readonly Mode

Readonly Mode is a special build mode that embeds Pokémon box data directly into the application code, creating a view-only version for sharing purposes.

### What is Readonly Mode

Readonly Mode allows you to distribute pre-configured Pokémon box data with the application. Users can view and analyze the embedded data, but cannot modify, add, or delete Pokémon from the box. This makes it ideal for sharing team recommendations, analysis results, or reference configurations.

### Use Case

- Share optimized team compositions with the community
- Distribute analysis results with embedded Pokémon data
- Create reference builds showcasing specific strategies
- Provide examples for educational or documentation purposes

### How to Build with Readonly Mode

1. **Export your Pokémon box data**:
   - Open the IV Calculator in your browser
   - Navigate to the Box tab
   - Use the Export function to download your box data

2. **Prepare the data file**:
   - Copy the exported JSON data to `embedded-box.txt` in the project root directory

3. **Build with readonly mode enabled**:
   ```bash
   VITE_READONLY_MODE=true npm run build
   ```

### Behavior in Readonly Mode

When running in readonly mode, the application has the following characteristics:

- **Hidden Controls**: Add, Edit, and Delete buttons are hidden from the interface
- **Import Disabled**: The import function is disabled to prevent data modification
- **Embedded Data**: Box data loads from `embedded-box.txt` instead of localStorage
- **Preserved Features**: Export and all calculation features continue to work normally

Users can still:
- View all embedded Pokémon data
- Use all calculation tools (RP, Strength, Rating)
- Export the embedded data for their own use
- Switch between different tabs and views

### Fork and Deploy Guide

To create your own readonly mode deployment on GitHub Pages:

1. **Fork the repository**:
   - Click the "Fork" button on the GitHub repository page
   - Clone your forked repository to your local machine

2. **Prepare your box data**:
   - Export your Pokémon box data from the IV Calculator
   - Save the exported JSON data

3. **Configure GitHub Variables**:
   - Go to your forked repository Settings → Secrets and variables → Actions
   - Click the **Variables** tab
   - Click "New repository variable"
   - Create a variable named `EMBEDDED_BOX_DATA`
   - Paste your exported Pokémon box JSON data as the value
   - Click "Add variable"

4. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Set Source to "GitHub Actions"
   - Push to the main branch to trigger deployment

5. **Verify deployment**:
   - Check Actions tab to see if the workflow runs successfully
   - Once completed, your readonly mode application will be available at `https://[username].github.io/pokesleep-tool/`
   - Open the IV Calculator and verify your embedded Pokémon box data loads correctly

**Note**: If the `EMBEDDED_BOX_DATA` variable is not configured, an empty `embedded-box.txt` file will be created, resulting in an empty box in readonly mode.

### Manual Workflow Execution

You can manually trigger the deployment workflow without pushing code or creating a pull request:

1. Go to the **Actions** tab in your GitHub repository
2. Select the **Deploy** workflow from the left sidebar
3. Click the **Run workflow** button on the right
4. Select the branch you want to deploy (usually `main`)
5. Click **Run workflow** to start the deployment

This is useful for:
- Re-deploying after changing GitHub Variables (e.g., updating `EMBEDDED_BOX_DATA`)
- Testing the deployment process without making code changes
- Quick deployments when needed

## License

MIT
