import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Eye, Database, Globe, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Privacy() {
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
              <Shield className="text-green-400" size={20} />
              <span className="text-sm text-green-400">GDPR Compliant</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-slate-300 text-lg">
              Your privacy and security are our top priorities. Last updated: January 22, 2025
            </p>
          </div>

          <div className="space-y-8">
            {/* Data Collection */}
            <Card className="bg-slate-800/40 border-slate-700/50">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Database className="text-blue-400 mr-3" size={24} />
                  <h2 className="text-2xl font-bold text-white">Information We Collect</h2>
                </div>
                <div className="space-y-4 text-slate-300">
                  <h3 className="text-lg font-semibold text-white">Device Information</h3>
                  <ul className="space-y-2 ml-4">
                    <li>• Device type and model (Android/iOS)</li>
                    <li>• IMEI numbers for tracking purposes</li>
                    <li>• Location coordinates when tracking is active</li>
                    <li>• Device status and battery information</li>
                  </ul>
                  
                  <h3 className="text-lg font-semibold text-white mt-6">Account Information</h3>
                  <ul className="space-y-2 ml-4">
                    <li>• Email addresses for service communication</li>
                    <li>• Payment information (processed securely via third-party)</li>
                    <li>• Service usage logs and timestamps</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Data Usage */}
            <Card className="bg-slate-800/40 border-slate-700/50">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Eye className="text-emerald-400 mr-3" size={24} />
                  <h2 className="text-2xl font-bold text-white">How We Use Your Information</h2>
                </div>
                <div className="space-y-4 text-slate-300">
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-emerald-400 mb-2">Primary Purposes</h3>
                    <ul className="space-y-2">
                      <li>• Provide accurate device location tracking services</li>
                      <li>• Send location updates and service notifications</li>
                      <li>• Process payments securely</li>
                      <li>• Improve our tracking accuracy and service quality</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-red-400 mb-2">We Never</h3>
                    <ul className="space-y-2">
                      <li>• Sell your personal information to third parties</li>
                      <li>• Track devices without explicit authorization</li>
                      <li>• Store payment card information on our servers</li>
                      <li>• Share location data with unauthorized parties</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card className="bg-slate-800/40 border-slate-700/50">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Lock className="text-yellow-400 mr-3" size={24} />
                  <h2 className="text-2xl font-bold text-white">Data Security & Protection</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4 text-slate-300">
                    <h3 className="text-lg font-semibold text-white">Technical Safeguards</h3>
                    <ul className="space-y-2">
                      <li>• 256-bit SSL/TLS encryption in transit</li>
                      <li>• AES-256 encryption for stored data</li>
                      <li>• Regular security audits and penetration testing</li>
                      <li>• Multi-factor authentication for admin access</li>
                    </ul>
                  </div>
                  <div className="space-y-4 text-slate-300">
                    <h3 className="text-lg font-semibold text-white">Compliance Standards</h3>
                    <ul className="space-y-2">
                      <li>• GDPR (General Data Protection Regulation)</li>
                      <li>• ISO 27001 Information Security Standard</li>
                      <li>• SOC 2 Type II Certified</li>
                      <li>• PCI DSS compliant payment processing</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Retention */}
            <Card className="bg-slate-800/40 border-slate-700/50">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Globe className="text-purple-400 mr-3" size={24} />
                  <h2 className="text-2xl font-bold text-white">Data Retention & Your Rights</h2>
                </div>
                <div className="space-y-6 text-slate-300">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Retention Periods</h3>
                    <div className="bg-slate-700/30 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Location tracking data:</span>
                        <span className="text-white">30 days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Account information:</span>
                        <span className="text-white">Until account deletion</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment records:</span>
                        <span className="text-white">7 years (legal requirement)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service logs:</span>
                        <span className="text-white">90 days</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Your Rights Under GDPR</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <ul className="space-y-2">
                        <li>• Right to access your personal data</li>
                        <li>• Right to rectify inaccurate information</li>
                        <li>• Right to erasure ("right to be forgotten")</li>
                        <li>• Right to restrict processing</li>
                      </ul>
                      <ul className="space-y-2">
                        <li>• Right to data portability</li>
                        <li>• Right to object to processing</li>
                        <li>• Rights related to automated decision-making</li>
                        <li>• Right to lodge a complaint</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="bg-gradient-to-r from-blue-600/20 to-emerald-600/20 border-blue-500/30">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4 text-white">Questions About Your Privacy?</h2>
                <p className="text-slate-300 mb-6">
                  Our Data Protection Officer is available to answer any privacy-related questions
                </p>
                <div className="space-y-2 text-slate-300">
                  <div><strong>Email:</strong> privacy@trackitnow.com</div>
                  <div><strong>Response time:</strong> Within 24 hours</div>
                  <div><strong>Address:</strong> Data Protection Officer, TrackIt Now Services</div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <p className="text-sm text-slate-400">
                    This policy was last updated on January 22, 2025. We may update this policy periodically. 
                    Significant changes will be communicated via email to registered users.
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