import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Satellite, 
  Clock, 
  Globe, 
  Star, 
  CheckCircle,
  Users,
  MapPin,
  Lock,
  Award
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      location: "New York, USA",
      rating: 5,
      comment: "Found my stolen iPhone in under 5 minutes! The location was incredibly accurate.",
      device: "iPhone 14 Pro"
    },
    {
      name: "Mohamed Al-Hassan",
      location: "Dubai, UAE", 
      rating: 5,
      comment: "Perfect service. Helped me locate my son's lost Android phone quickly and safely.",
      device: "Samsung Galaxy S23"
    },
    {
      name: "Emma Martinez",
      location: "Madrid, Spain",
      rating: 5,
      comment: "Professional and secure. Got my device back thanks to the precise GPS tracking.",
      device: "iPhone 13"
    }
  ];

  const stats = [
    { number: "50,000+", label: "Devices Located", icon: MapPin },
    { number: "99.8%", label: "Success Rate", icon: CheckCircle },
    { number: "2 mins", label: "Average Time", icon: Clock },
    { number: "24/7", label: "Support Available", icon: Shield }
  ];

  const features = [
    {
      icon: Satellite,
      title: "Real-time GPS Tracking",
      description: "Precise location tracking with advanced satellite technology"
    },
    {
      icon: Shield,
      title: "Military-grade Security",
      description: "Your data is encrypted with bank-level security protocols"
    },
    {
      icon: Globe,
      title: "Global Coverage",
      description: "Works worldwide on all Android and iOS devices"
    },
    {
      icon: Clock,
      title: "Instant Results",
      description: "Get location coordinates within minutes of activation"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-50">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Satellite className="text-white" size={20} />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                TrackIt Now
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-green-500/50 text-green-400">
                <Lock className="w-3 h-3 mr-1" />
                SSL Secured
              </Badge>
              <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                <Award className="w-3 h-3 mr-1" />
                GDPR Compliant
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent">
            Find Any Lost Device
            <br />
            <span className="text-slate-200">In Minutes</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Professional device tracking service with military-grade security. 
            Locate any Android or iOS device worldwide with pinpoint accuracy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/tracking">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 text-lg">
                Start Tracking Now
              </Button>
            </Link>
            <div className="flex items-center text-slate-400">
              <CheckCircle className="w-5 h-5 mr-2 text-emerald-400" />
              <span>30-second setup • No app required</span>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-slate-800/30 rounded-lg p-4 backdrop-blur-sm">
                <stat.icon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stat.number}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-800/20 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">Why Choose TrackIt Now?</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Professional-grade tracking technology trusted by security experts worldwide
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60 transition-colors">
                <CardContent className="p-6 text-center">
                  <feature.icon className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">Success Stories</h2>
            <p className="text-xl text-slate-300">Real customers, real results</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-slate-800/40 border-slate-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-300 mb-4 italic">"{testimonial.comment}"</p>
                  <div className="border-t border-slate-700 pt-4">
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-slate-400">{testimonial.location}</div>
                    <div className="text-sm text-blue-400">{testimonial.device}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-emerald-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-white">Ready to Find Your Device?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust TrackIt Now for professional device recovery
          </p>
          <Link href="/tracking">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-3 text-lg font-semibold">
              Start Tracking - Only $9.99
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Satellite className="text-white" size={16} />
                </div>
                <span className="text-xl font-bold text-white">TrackIt Now</span>
              </div>
              <p className="text-slate-400">Professional device tracking services worldwide.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <div className="space-y-2 text-slate-400">
                <Link href="/privacy" className="block hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="block hover:text-white transition-colors">Terms of Service</Link>
                <Link href="/gdpr" className="block hover:text-white transition-colors">GDPR Compliance</Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Security</h4>
              <div className="space-y-2 text-slate-400">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-green-400" />
                  <span>256-bit SSL Encryption</span>
                </div>
                <div className="flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-green-400" />
                  <span>GDPR Compliant</span>
                </div>
                <div className="flex items-center">
                  <Award className="w-4 h-4 mr-2 text-green-400" />
                  <span>ISO 27001 Certified</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <div className="space-y-2 text-slate-400">
                <div>24/7 Support Available</div>
                <div>support@trackitnow.com</div>
                <div>Response time: &lt; 1 hour</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 TrackIt Now. All rights reserved. Professional device tracking services.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}