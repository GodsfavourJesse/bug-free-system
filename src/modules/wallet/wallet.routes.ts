import { Router } from "express";

import { walletController } from "./wallet.controller";

import { authenticate } from "@/middlewares/auth.middleware";


const router = Router();


// Get complete wallet information.
// Protected: authenticated users only.
router.get(
    "/",
    authenticate,
    walletController.getWallet,
);


// Get wallet balances only.
// Protected: authenticated users only.
router.get(
    "/balance",
    authenticate,
    walletController.getBalance,
);


export default router;