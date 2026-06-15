"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShieldCheck, BarChart3, BrainCircuit, ArrowRight, Play, 
  FileText, LineChart, Search, Users, Zap, Briefcase, 
  Globe, Database, LayoutDashboard 
} from "lucide-react";
import Link from "next/link";

import { Show, UserButton } from "@clerk/nextjs";

const features = [
  {
    title: "AI-Powered Insights",
    description: "Leverage advanced machine learning to uncover hidden risks and opportunities in your target companies.",
    icon: BrainCircuit,
  },
  {
    title: "Deep Financial Analysis",
    description: "Automate financial modeling and evaluate unit economics instantly with our proprietary algorithms.",
    icon: BarChart3,
  },
  {
    title: "Comprehensive Security",
    description: "Enterprise-grade data protection ensures your deal flow and sensitive information remain confidential.",
    icon: ShieldCheck,
  },
];

const targetUsers = [
  { role: "Venture Capitalists", desc: "Accelerate deal screening and automate deep due diligence workflows.", icon: Briefcase },
  { role: "Private Equity", desc: "Uncover operational inefficiencies and identify value creation levers.", icon: LineChart },
  { role: "M&A Advisors", desc: "Deliver comprehensive risk assessments and market landscapes to clients.", icon: Users },
  { role: "Corporate Strategy", desc: "Evaluate strategic acquisitions and competitive market dynamics.", icon: Globe },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-foreground selection:bg-primary/20">
      {/* Navigation */}
      <header className="px-6 lg:px-12 py-5 flex items-center justify-between border-b border-border/40 backdrop-blur-xl sticky top-0 z-50 bg-background/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <BrainCircuit className="text-primary-foreground w-5 h-5" />
          </div>
          <span className="text-2xl font-bold font-heading tracking-tight text-foreground">
            Venture<span className="text-primary">IQ</span>
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</Link>
          <Link href="#demo" className="hover:text-foreground transition-colors">Demo</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Show when="signed-out">
            <Link href="/sign-in">
              <Button variant="ghost" className="hidden sm:flex hover:bg-secondary/50 transition-colors">
                Log in
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                Get Started
              </Button>
            </Link>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard">
              <Button variant="ghost" className="hidden sm:flex hover:bg-secondary/50 transition-colors">
                Dashboard
              </Button>
            </Link>
            <UserButton />
          </Show>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="px-6 lg:px-12 pt-24 pb-32 md:pt-32 md:pb-40 flex flex-col items-center text-center justify-center relative overflow-hidden">
          {/* Subtle Background Glows */}
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 translate-x-1/4 translate-y-1/4 w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-accent/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm mb-4 shadow-sm"
            >
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2.5 animate-pulse"></span>
              VentureIQ 2.0 is now live
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold font-heading tracking-tight text-foreground leading-[1.15]">
              AI-powered due diligence <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-accent italic pr-2">
                for smarter decisions
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Accelerate your deal flow, uncover hidden risks, and make data-driven investment decisions with our enterprise-grade AI intelligence platform.
            </p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
            >
              <Link href="/sign-up">
                <Button size="lg" className="h-14 px-8 text-base shadow-lg shadow-primary/20 group hover:-translate-y-1 transition-all duration-300">
                  Start Analysis
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base bg-background/50 backdrop-blur-sm border-border/60 hover:bg-secondary/40 hover:-translate-y-1 transition-all duration-300">
                  <Play className="mr-2 w-4 h-4 text-primary" />
                  View Demo
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Logos / Social Proof Placeholder */}
        <section className="border-y border-border/40 bg-secondary/20 py-10">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-widest">Trusted by leading investment firms</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale">
              {/* Placeholders for logos */}
              <div className="font-heading text-xl font-bold">Sequoia</div>
              <div className="font-heading text-xl font-bold">a16z</div>
              <div className="font-heading text-xl font-bold">Founders Fund</div>
              <div className="font-heading text-xl font-bold">Lightspeed</div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-6 lg:px-12 py-24 md:py-32">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 md:mb-24">
              <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6">Everything you need to evaluate deals</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our platform combines cutting-edge AI with deep financial expertise to give you the ultimate edge in your investments.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <Card className="h-full border-border/50 bg-background hover:bg-secondary/10 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-2 group">
                    <CardHeader>
                      <div className="w-14 h-14 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
                        <feature.icon className="w-7 h-7 text-primary" />
                      </div>
                      <CardTitle className="text-2xl font-heading">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base text-muted-foreground leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="px-6 lg:px-12 py-24 md:py-32 bg-secondary/30 border-y border-border/50">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <h2 className="text-3xl md:text-5xl font-bold font-heading leading-tight">
                  From data room to <br/>
                  <span className="text-primary italic">decision ready</span>
                </h2>
                <div className="space-y-6">
                  {[
                    { step: "01", title: "Upload Data Room", desc: "Securely connect or upload pitch decks, financials, and legal docs." },
                    { step: "02", title: "AI Processing", desc: "Our models extract key metrics, flag risks, and cross-reference market data." },
                    { step: "03", title: "Review Insights", desc: "Interact with the AI to drill down into specific areas of concern." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="text-2xl font-heading font-bold text-primary/30 group-hover:text-primary transition-colors">{item.step}</div>
                      <div>
                        <h4 className="text-xl font-bold mb-1">{item.title}</h4>
                        <p className="text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent/10 rounded-2xl transform rotate-3 scale-105 -z-10" />
                <Card className="border-border shadow-2xl bg-background/80 backdrop-blur-xl overflow-hidden">
                  <CardHeader className="border-b border-border/50 bg-secondary/30 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-destructive/80" />
                      <div className="w-3 h-3 rounded-full bg-accent/80" />
                      <div className="w-3 h-3 rounded-full bg-primary/80" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="h-8 w-1/3 bg-secondary rounded animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-secondary rounded" />
                        <div className="h-4 w-5/6 bg-secondary rounded" />
                        <div className="h-4 w-4/6 bg-secondary rounded" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="h-24 bg-secondary rounded-lg border border-border/50" />
                        <div className="h-24 bg-secondary rounded-lg border border-border/50" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Analysis Input Types */}
        <section className="px-6 lg:px-12 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <h2 className="text-3xl md:text-5xl font-bold font-heading">Analyze any document type</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: FileText, label: "Pitch Decks" },
                { icon: Database, label: "Financial Models" },
                { icon: ShieldCheck, label: "Legal Contracts" },
                { icon: Search, label: "Cap Tables" }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-secondary/20 border border-border/30 hover:bg-secondary/50 transition-colors"
                >
                  <item.icon className="w-8 h-8 text-primary" />
                  <span className="font-medium text-sm md:text-base">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Demo Report Preview */}
        <section id="demo" className="px-6 lg:px-12 py-24 md:py-32 bg-foreground text-background relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none opacity-50" />
          
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6">See VentureIQ in action</h2>
              <p className="text-muted/80 max-w-2xl mx-auto text-lg">
                Explore a sample due diligence report generated entirely by our AI from raw data room files.
              </p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="rounded-xl overflow-hidden border border-border/10 shadow-2xl bg-card text-card-foreground"
            >
              <Tabs defaultValue="summary" className="w-full">
                <div className="border-b border-border bg-secondary/50 px-4 py-2 flex items-center justify-between">
                  <TabsList className="bg-transparent">
                    <TabsTrigger value="summary" className="data-[state=active]:bg-background">Exec Summary</TabsTrigger>
                    <TabsTrigger value="financials" className="data-[state=active]:bg-background">Financials</TabsTrigger>
                    <TabsTrigger value="risks" className="data-[state=active]:bg-background">Risk Flags</TabsTrigger>
                  </TabsList>
                  <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <LayoutDashboard className="w-4 h-4" />
                    Interactive Report
                  </div>
                </div>
                
                <TabsContent value="summary" className="p-8 m-0 min-h-[400px]">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold font-heading">Acme Corp - Due Diligence</h3>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full uppercase tracking-wider">Strong Buy</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Based on the analysis of 42 documents, Acme Corp shows exceptional unit economics with an LTV/CAC ratio of 4.2x. Market penetration is growing 15% MoM, outpacing primary competitors.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-6 pt-4">
                      {['ARR', 'Gross Margin', 'Runway'].map((metric, i) => (
                        <div key={i} className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                          <div className="text-sm text-muted-foreground mb-1">{metric}</div>
                          <div className="text-2xl font-bold">{['$12.4M', '78%', '24 mos'][i]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="financials" className="p-8 m-0 min-h-[400px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground space-y-4">
                    <BarChart3 className="w-12 h-12 mx-auto opacity-20" />
                    <p>Financial projections and historical analysis visualization would appear here.</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="risks" className="p-8 m-0 min-h-[400px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground space-y-4">
                    <Zap className="w-12 h-12 mx-auto opacity-20" />
                    <p>Automated red flags from legal and technical due diligence would appear here.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </section>

        {/* Target Users */}
        <section className="px-6 lg:px-12 py-24 md:py-32">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold font-heading text-center mb-16">Built for top-tier dealmakers</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {targetUsers.map((user, i) => (
                <Card key={i} className="border-border/50 bg-secondary/10 hover:bg-secondary/30 transition-colors">
                  <CardHeader>
                    <user.icon className="w-8 h-8 text-primary mb-4" />
                    <CardTitle className="text-lg">{user.role}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{user.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 lg:px-12 py-24 md:py-32 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold font-heading leading-tight">
              Ready to transform your diligence process?
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Join leading investment firms using VentureIQ to evaluate deals 10x faster with AI precision.
            </p>
            <div className="pt-8">
              <Link href="/sign-up">
                <Button size="lg" className="h-14 px-10 text-lg bg-background text-foreground hover:bg-background/90 hover:scale-105 transition-all duration-300 shadow-xl">
                  Get Started Today
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <BrainCircuit className="text-primary w-5 h-5" />
              <span className="text-xl font-bold font-heading tracking-tight">
                Venture<span className="text-primary">IQ</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered due diligence for smarter business decisions.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="#how-it-works" className="hover:text-primary transition-colors">How it Works</Link></li>
              <li><Link href="#demo" className="hover:text-primary transition-colors">Interactive Demo</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto pt-8 border-t border-border/50 text-center text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} VentureIQ. All rights reserved.</p>
          <div className="mt-4 md:mt-0 space-x-4">
            <span>Built for modern dealmakers</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
