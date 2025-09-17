"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Eye,
  Zap,
  Lock,
  ArrowRight,
  Github,
  Twitter,
  Menu,
  X,
  CheckCircle,
  Users,
  Globe,
  Shuffle,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-black/95 backdrop-blur-md border-b border-white/20"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Shuffle className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold text-white">White Noise</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Button className="bg-white text-black hover:bg-gray-200 font-semibold">
                Launch App
              </Button>
            </nav>

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
                <button
                  onClick={() => scrollToSection("features")}
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  How it Works
                </button>
                <button
                  onClick={() => scrollToSection("security")}
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  Security
                </button>
                <Button className="w-full bg-white text-black hover:bg-gray-200 font-semibold">
                  Launch App
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <Badge
                variant="outline"
                className="border-white/30 text-white mb-6 bg-white/5"
              >
                ✨ CNTRL + Educate Hackathon Submission
              </Badge>
              <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
                WHITE NOISE
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-xl leading-relaxed">
                An open source, zero-fee anonymous Aptos mixer utilizing Merkle
                trees for maximum privacy and security
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-gray-200 font-semibold shadow-lg hover:shadow-xl transition-all group"
                >
                  <Link href="/mix"> Launch Application </Link>
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white text-black hover:bg-gray-200 font-semibold shadow-lg hover:shadow-xl transition-all group"
                >
                  <Github className="mr-2 w-4 h-4" />
                  View on GitHub
                </Button>
              </div>
            </div>
            <div className="relative p-8 border border-white/20 rounded-2xl shadow-2xl backdrop-blur-sm bg-white/5">
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 text-white">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-sm font-medium">Low fees &bull; Maximum privacy</span>
                  </div>
                  <div className="h-1 bg-white/20 rounded-full">
                    <div className="h-full w-full bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-extrabold text-white">100%</div>
                    <div className="text-sm text-gray-400 mt-1">Anonymous and Secure</div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Mixes Completed</span>
                    <span className="font-semibold text-white">???</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Total APT Mixed</span>
                    <span className="font-semibold text-white">???</span>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose White Noise?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Advanced privacy technology meets user-friendly design for the
              ultimate anonymous transaction experience
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white/5 border-white/20 hover:border-white/40 transition-all duration-300 group hover:bg-white/10">
              <CardHeader>
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-black" />
                </div>
                <CardTitle className="text-white group-hover:text-white transition-colors">
                  Zero Knowledge Proofs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Cryptographically proven anonymity using advanced
                  zero-knowledge proof systems
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/20 hover:border-white/40 transition-all duration-300 group hover:bg-white/10">
              <CardHeader>
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-black" />
                </div>
                <CardTitle className="text-white group-hover:text-white transition-colors">
                  Zero Fees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  No hidden costs or transaction fees. Keep 100% of your funds
                  while maintaining privacy
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/20 hover:border-white/40 transition-all duration-300 group hover:bg-white/10">
              <CardHeader>
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-black" />
                </div>
                <CardTitle className="text-white group-hover:text-white transition-colors">
                  Complete Anonymity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Break transaction links and protect your financial privacy
                  with military-grade mixing
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Simple steps to achieve complete transaction privacy on the Aptos
              blockchain
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl font-bold text-black">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Deposit</h3>
              <p className="text-gray-400">
                Send your Aptos tokens to our mixing pool with your chosen
                amount
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl font-bold text-black">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Mix</h3>
              <p className="text-gray-400">
                Your tokens are mixed with others using Merkle tree technology
                for anonymity
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl font-bold text-black">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Withdraw
              </h3>
              <p className="text-gray-400">
                Receive your tokens at any address with complete privacy and
                zero fees
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/20 bg-black">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-gray-400">
            <p>&copy; 2025 MIXER. Built for CNTRL + Educate Hackathon.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
