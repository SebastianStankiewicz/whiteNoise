"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Shuffle,
  Wallet,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState, useEffect } from "react";
import api from "../../../lib/axios";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

const { Aptos, AptosConfig, Network } = require("@aptos-labs/ts-sdk");
const config = new AptosConfig({ network: Network.TESTNET });
const sdk = new Aptos(config);

export default function Mix() {
  const [backendInitData, setBackendInitData] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [dragAndDropState, setDragAndDropState] = useState(null);
  const [secret, setSecret] = useState("");
  const [result, setResult] = useState(null);
  const [withdrawData, setWithdrawData] = useState({
    secret: "",
    proof: [],
    root: "",
  });
  const [withdrawHASH, setWithdrawHASH] = useState(null);
  const {
    account,
    connect,
    connected,
    disconnect,
    wallet,
    wallets,
    signAndSubmitTransaction,
  } = useWallet();

  const fetchVaultData = async () => {
    try {
      const res = await api.get("/vaultInfo");
      console.log(res);
      if (res.status === 200) {
        setBackendInitData(res["data"]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const generateSecret = () => {
    const randomSecret = window.crypto.randomUUID().toString();
    setSecret(randomSecret);
  };

  useEffect(() => {
    fetchVaultData();

    generateSecret();
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const depositTX = async () => {
    const amountInOctas = 0.1 * 1e8;
    const transaction = {
      data: {
        function:
          "0x9c19f31c0e121a67ef47a340c3d47d0f930df610b2ad9252c8b6885a9d67c753::whiteNoise::deposit",
        typeArguments: [],
        functionArguments: [amountInOctas.toString()],
      },
    };

    try {
      const response = await signAndSubmitTransaction(transaction);
      await sdk.waitForTransaction({ transactionHash: response.hash });
      console.log("Deposit successful:", response.hash);
      return response.hash;
    } catch (e) {
      console.error("Deposit failed:", e);
      return null;
    }
  };

  const deposit = async () => {
    if (!secret) return alert("Generate a secret first!");
    let txHASH = await depositTX();
    console.log(txHASH);
    try {
      const res = await api.post("/deposit", { secret, txHASH });
      setResult(res.data);
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  const withdraw = async () => {
    try {
      const res = await api.post("/withdraw", {
        withdrawData,
        withdrawAddress,
      });
      console.log(JSON.stringify(res.data));
      let formattedData = res.data;
      if (formattedData.tx == false) {
        alert("Invalid recipt");
      } else {
        setWithdrawHASH(formattedData.tx.TX.hash);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const downloadReceipt = () => {
    if (!secret || !result?.proof || !result?.root) {
      console.error("Missing required data for receipt.");
      console.log(result);
      console.log(secret);
      return;
    }

    const data = {
      secret,
      proof: result.proof,
      root: result.root,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "APTOSproofOfConcept.json";
    link.click();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-black/95 backdrop-blur-md border-b border-white/20"
            : "bg-black border-b border-white/20"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Shuffle className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold text-white">WHITE NOISE</span>
              <Badge
                variant="outline"
                className="border-white/30 text-white bg-white/5 ml-4"
              >
                Vault
              </Badge>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6"></nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-white/20">
              <div className="px-4 py-6 space-y-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Wallet
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
                >
                  <History className="w-4 h-4 mr-2" />
                  History
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white/30 text-white hover:bg-white/10 hover:border-white/50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Wallet Overview */}
          <div className="mb-8">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg">
                    Confused?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/30 text-black hover:bg-white/10"
                  >
                    Understand how White Noise works
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/20 hover:border-white/40 transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-sm font-medium">
                    Connected To Merkle Tree?
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-row items-center gap-2">
                  {backendInitData !== null ? (
                    <>
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                      <div className="text-2xl font-bold text-white mb-1">
                        Yes
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                      <div className="text-2xl font-bold text-white mb-1">
                        No
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/20 hover:border-white/40 transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-sm font-medium">
                    Earn Yield
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <Button
                    size="sm"
                    variant="outline"
                    className="border-white/30 text-black hover:bg-white/10"
                  >
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Dashboard */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Mixing Interface */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="deposit" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/20">
                  <TabsTrigger
                    value="deposit"
                    className="data-[state=active]:bg-white data-[state=active]:text-black text-white"
                  >
                    <ArrowDownLeft className="w-4 h-4 mr-2" />
                    Deposit
                  </TabsTrigger>
                  <TabsTrigger
                    value="withdraw"
                    className="data-[state=active]:bg-white data-[state=active]:text-black text-white"
                  >
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Withdraw
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="deposit" className="mt-6">
                  <Card className="bg-white/5 border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Shield className="w-5 h-5 mr-2" />
                        Deposit to Mixing Pool
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Send your APT tokens to the mixing pool for
                        anonymization. No yield will be earned.
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6 flex-col">
                      <div className="space-y-2">
                        <Label htmlFor="secret" className="text-white">
                          Secret Value
                        </Label>
                        <div className="flex flex-row gap-5">
                          <Input
                            id="secret"
                            type="string"
                            placeholder="Dont share...."
                            value={secret}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            className="bg-white/5 border-white/20 text-white "
                            disabled={true}
                          />

                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/30 text-black hover:bg-white/10"
                            onClick={generateSecret}
                          >
                            Generate Secret Value
                          </Button>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-white text-black hover:bg-gray-200 font-semibold"
                        disabled={!secret}
                        onClick={deposit}
                      >
                        Deposit (1) Aptos
                      </Button>
                      {result !== null ? (
                        <>
                          <div className="p-6 w-full bg-amber-50 rounded-lg border border-amber-200 text-center space-y-3">
                            <div className="font-extrabold text-amber-800 text-sm tracking-wide">
                              🚨 KEEP THIS SAFE 🚨
                            </div>
                            <p className="text-sm text-amber-700">
                              Download your receipt to withdraw funds.
                            </p>
                            <Button
                              onClick={downloadReceipt}
                              className="bg-amber-500 hover:bg-amber-600 text-white w-full"
                            >
                              Download Receipt
                            </Button>
                          </div>
                        </>
                      ) : (
                        <></>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="withdraw" className="mt-6">
                  <Card className="bg-white/5 border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Shield className="w-5 h-5 mr-2" />
                        Withdraw from Pool
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Withdraw your mixed tokens to any address anonymously
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              try {
                                const parsed = JSON.parse(event.target.result);
                                setWithdrawData({
                                  secret: parsed.secret || "",
                                  proof: parsed.proof || [],
                                  root: parsed.root || "",
                                  wallet: parsed.wallet || "",
                                });
                                setDragAndDropState("success");
                              } catch (err) {
                                setDragAndDropState("Failed");
                              }
                            };
                            reader.readAsText(file);
                          }
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        className={`w-full border-2 border-dashed rounded-lg p-8 text-center text-gray-500 hover:border-blue-500 transition cursor-pointer ${
                          dragAndDropState === "failed"
                            ? "border-red-500"
                            : dragAndDropState === "success"
                            ? "border-green-500"
                            : "border-gray-300"
                        }`}
                      >
                        <p className="text-sm">
                          Drag and drop a withdrawal file here (JSON)
                        </p>
                        <p className="text-xs mt-2">
                          Expected format: {"{ secret, proof, root, wallet }"}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="withdraw-amount" className="text-white">
                          Withdraw Address
                        </Label>
                        <Input
                          id="withdraw-address"
                          type="string"
                          placeholder="0x..."
                          value={withdrawAddress}
                          onChange={(e) => setWithdrawAddress(e.target.value)}
                          className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-white/40"
                        />
                        <div className="text-sm text-gray-400">
                          Warning: An invalid address may lead to a loss of
                          funds.
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-lg p-4 border border-white/20">
                        <div className="flex items-center space-x-2 text-white mb-2">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Privacy Notice
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">
                          Your withdrawal will be processed anonymously through
                          our Merkle tree mixing system. No connection between
                          deposit and withdrawal addresses.
                        </p>
                      </div>

                      {withdrawHASH !== null ? (
                        <div className="p-6 w-full bg-amber-50 rounded-lg border border-amber-200 text-center space-y-3">
                          <div className="font-extrabold text-amber-800 text-sm tracking-wide">
                            SUCCESS
                          </div>
                          <p className="text-sm text-amber-700">
                            <a
                              href={`https://explorer.aptoslabs.com/txn/${withdrawHASH}?network=testnet`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:text-amber-900"
                            >
                              View Transaction on Aptos Explorer
                            </a>
                          </p>
                        </div>
                      ) : null}

                      <Button
                        className="w-full bg-white text-black hover:bg-gray-200 font-semibold"
                        disabled={!withdrawAddress}
                        onClick={withdraw}
                      >
                        Withdraw (1) Aptos
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Mixing Status */}
              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg">
                    Pool Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">USDC</span>
                    <span className="text-white font-medium">
                      {backendInitData !== null
                        ? backendInitData.APT
                        : "Loading..."}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Aptos</span>
                    <span className="text-white font-medium">
                      {backendInitData !== null
                        ? backendInitData.USDC
                        : "Loading..."}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">APR</span>
                    <span className="text-white font-medium">
                      {backendInitData !== null
                        ? `${backendInitData.APR}%`
                        : "Loading..."}
                    </span>
                  </div>
                  <Separator className="bg-white/20" />
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-400">
                      Deposits will be mixed into this pool. Place holder
                      values.
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Security Features */}
              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg">
                    Security Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span className="text-sm text-gray-400">
                      Zero-knowledge proofs
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span className="text-sm text-gray-400">
                      Merkle tree anonymity
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span className="text-sm text-gray-400">
                      No transaction fees
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span className="text-sm text-gray-400">
                      Open source code
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
