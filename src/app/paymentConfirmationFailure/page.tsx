"use client";
import { useRouter } from 'next/navigation';
export default function PaymentFailure() {
    const router = useRouter();
    return (
        <div className="bg p-3 overflow-y-auto d-flex justify-content-center align-items-center">
            <div className="col-sm-12 col-md-12 col-lg-5 col-xl-5">
                <div className="payment-confirmation-card">
                    <div className="text-center">
                        <div className="font-pop-36 fw-700 dark">Payment Failed</div>
                    </div>
                    <div className="pt-2 border-0">
                        <div className="text-center">
                        <img src="/failure.svg" alt="" />
                        </div>
                    </div>
                    <div className="footer mt-4">
                        <div className="btn-primary cursor" onClick={()=>{
                            router.push('/registration')
                        }}>
                            Try Again or Contact Support
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}