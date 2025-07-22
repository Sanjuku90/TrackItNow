import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, QrCode } from "lucide-react";

interface PaymentSectionProps {
  selectedDevice: string;
  imei: string;
  isVisible: boolean;
  onPaymentConfirmed: () => void;
}

export function PaymentSection({ selectedDevice, imei, isVisible, onPaymentConfirmed }: PaymentSectionProps) {
  if (!isVisible) return null;

  return (
    <div className="mb-8 animate-in slide-in-from-bottom-5 duration-300">
      <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <CreditCard className="text-blue-400 mr-3" size={24} />
            Payment Required - $9.99
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Service Details</h3>
              <div className="space-y-3 text-slate-300">
                <div className="flex justify-between">
                  <span>Device:</span>
                  <span>{selectedDevice}</span>
                </div>
                <div className="flex justify-between">
                  <span>IMEI:</span>
                  <span className="font-mono">{imei}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span>Instant Location</span>
                </div>
                <div className="flex justify-between border-t border-slate-600 pt-3 text-white font-bold">
                  <span>Total:</span>
                  <span>$9.99 USD</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Crypto Payment (USDT TRC-20)</h3>
              <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-slate-300 mb-2">Send exactly $9.99 USDT to:</p>
                <div className="bg-slate-900 rounded p-3 font-mono text-sm break-all border">
                  TAB1oeEKDS5NATwFAaUrTioDU9djX7anyS
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 flex justify-center mb-4">
                <QrCode className="w-32 h-32 text-gray-400" />
              </div>
              
              <Button 
                onClick={onPaymentConfirmed}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-6"
              >
                I've Sent Payment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
