import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scale, FileText, AlertTriangle, Users, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-50">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="text-slate-300 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <Scale className="text-blue-400" size={20} />
              <span className="text-sm text-blue-400">Legal Terms</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Terms of Service
            </h1>
            <p className="text-slate-300 text-lg">
              Please read these terms carefully before using our services. Last updated: January 22, 2025
            </p>
          </div>

          <div className="space-y-8">
            {/* Acceptance */}
            <Card className="bg-slate-800/40 border-slate-700/50">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <FileText className="text-blue-400 mr-3" size={24} />
                  <h2 className="text-2xl font-bold text-white">Acceptance of Terms</h2>
                </div>
                <div className="space-y-4 text-slate-300">
                  <p>
                    By accessing and using TrackIt Now services, you agree to be bound by these Terms of Service 
                    and all applicable laws and regulations. If you do not agree with any of these terms, 
                    you are prohibited from using or accessing this service.
                  </p>
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-300">
                      <strong>Legal Age Requirement:</strong> You must be at least 18 years old or have 
                      parental consent to use our tracking services.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Description */}
            <Card className="bg-slate-800/40 border-slate-700/50">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Users className="text-emerald-400 mr-3" size={24} />
                  <h2 className="text-2xl font-bold text-white">Service Description</h2>
                </div>
                <div className="space-y-4 text-slate-300">
                  <h3 className="text-lg font-semibold text-white">What We Provide</h3>
                  <ul className="space-y-2 ml-4">
                    <li>• GPS-based device location tracking services</li>
                    <li>• Real-time coordinate reporting</li>
                    <li>• Email notifications with location updates</li>
                    <li>• Secure data transmission and storage</li>
                  </ul>
                  
                  <h3 className="text-lg font-semibold text-white mt-6">Service Limitations</h3>
                  <div className="bg-slate-700/30 rounded-lg p-4 space-y-2">
                    <p>• Location accuracy depends on GPS signal strength and device connectivity</p>
                    <p>• Service availability may vary by geographic location</p>
                    <p>• We cannot guarantee 100% uptime or tracking success in all conditions</p>
                    <p>• Battery life and device settings affect tracking performance</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Legal Use */}
            <Card className="bg-slate-800/40 border-slate-700/50">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <AlertTriangle className="text-yellow-400 mr-3" size={24} />
                  <h2 className="text-2xl font-bold text-white">Acceptable Use Policy</h2>
                </div>
                <div className="space-y-6 text-slate-300">
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-400 mb-2">Permitted Uses</h3>
                    <ul className="space-y-2">
                      <li>• Tracking your own personal devices</li>
                      <li>• Monitoring devices of minor children (with parental authority)</li>
                      <li>• Company-owned devices (with employee consent)</li>
                      <li>• Recovery of lost or stolen personal property</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-red-400 mb-2">Prohibited Uses</h3>
                    <ul className="space-y-2">
                      <li>• Tracking individuals without their knowledge or consent</li>
                      <li>• Stalking, harassment, or any form of unwanted surveillance</li>
                      <li>• Violation of privacy laws or regulations</li>
                      <li>• Commercial espionage or competitor monitoring</li>
                      <li>• Any activity that violates local, state, or federal laws</li>
                    </ul>
                  </div>
                  
                  <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
                    <p className="text-amber-300">
                      <strong>Important Legal Notice:</strong> Users are solely responsible for ensuring 
                      their use of tracking services complies with all applicable laws in their jurisdiction. 
                      Unauthorized tracking may result in criminal charges and civil liability.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Terms */}
            <Card className="bg-slate-800/40 border-slate-700/50">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Scale className="text-purple-400 mr-3" size={24} />
                  <h2 className="text-2xl font-bold text-white">Payment Terms</h2>
                </div>
                <div className="space-y-4 text-slate-300">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Pricing & Billing</h3>
                      <ul className="space-y-2">
                        <li>• Service fee: $9.99 USD per tracking request</li>
                        <li>• Payment processing via secure cryptocurrency (USDT)</li>
                        <li>• All fees are non-refundable once service is initiated</li>
                        <li>• Pricing subject to change with 30 days notice</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Refund Policy</h3>
                      <ul className="space-y-2">
                        <li>• No refunds after tracking service has begun</li>
                        <li>• Technical failures: Service credit or retry offered</li>
                        <li>• Disputes must be reported within 24 hours</li>
                        <li>• Refund requests reviewed case-by-case</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Liability */}
            <Card className="bg-slate-800/40 border-slate-700/50">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Scale className="text-red-400 mr-3" size={24} />
                  <h2 className="text-2xl font-bold text-white">Limitation of Liability</h2>
                </div>
                <div className="space-y-4 text-slate-300">
                  <div className="bg-slate-700/50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Service Disclaimers</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• Services provided "as-is" without warranties of any kind</li>
                      <li>• We do not guarantee specific tracking results or outcomes</li>
                      <li>• Location accuracy may vary due to technical limitations</li>
                      <li>• Users assume full responsibility for legal compliance</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-300 text-sm">
                      <strong>Maximum Liability:</strong> Our total liability for any claims arising 
                      from the use of our services is limited to the amount paid for the specific 
                      service in question, not to exceed $9.99 USD.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="bg-gradient-to-r from-blue-600/20 to-emerald-600/20 border-blue-500/30">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4 text-white">Questions About These Terms?</h2>
                <p className="text-slate-300 mb-6">
                  Our legal team is available to clarify any aspects of these terms
                </p>
                <div className="space-y-2 text-slate-300">
                  <div><strong>Email:</strong> legal@trackitnow.com</div>
                  <div><strong>Business Hours:</strong> Monday-Friday, 9 AM - 6 PM EST</div>
                  <div><strong>Response Time:</strong> Within 48 hours</div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <p className="text-sm text-slate-400">
                    These terms are governed by the laws of the jurisdiction where our services are provided. 
                    Any disputes will be resolved through binding arbitration. Last updated: January 22, 2025.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}