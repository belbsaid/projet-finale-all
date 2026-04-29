import "dotenv/config";
import { connectDB } from "./services/db.js";
import { logger } from "./utils/logger.js";
import app from "./app.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      logger.info(`Server is running on http://localhost:${process.env.PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      console.log(
        `🚗 Car Import Backend running on http://localhost:${process.env.PORT}`,
      );
    });
  })
  .catch((error) => {
    logger.error("Failed to start server:", { error });
    process.exit(1);
  });
