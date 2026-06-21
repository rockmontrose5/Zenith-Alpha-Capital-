import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import investmentPlansRouter from "./investmentPlans";
import portfoliosRouter from "./portfolios";
import transactionsRouter from "./transactions";
import referralsRouter from "./referrals";
import dashboardRouter from "./dashboard";
import blogRouter from "./blog";
import adminRouter from "./admin";
import cryptoRouter from "./crypto";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/users", usersRouter);
router.use("/investment-plans", investmentPlansRouter);
router.use("/portfolios", portfoliosRouter);
router.use("/transactions", transactionsRouter);
router.use("/referrals", referralsRouter);
router.use("/dashboard", dashboardRouter);
router.use("/blog", blogRouter);
router.use("/admin", adminRouter);
router.use("/crypto", cryptoRouter);

export default router;
