import { Link } from "react-router-dom";

export default function ClientFooter() {
    return (
        <footer className="mt-10 border-t border-[#dfe5eb] bg-white">
            <div className="mx-auto grid w-full max-w-[1220px] gap-6 px-4 py-8 text-sm text-[#5f6368] sm:px-6 lg:grid-cols-3 lg:px-8">
                <div>
                    <p className="text-base font-semibold text-[#202124]">Anjana Grocery</p>
                    <p className="mt-2">
                        Fast grocery ordering, mobile-friendly checkout, and transparent delivery updates.
                    </p>
                </div>

                <div>
                    <p className="text-base font-semibold text-[#202124]">Company</p>
                    <div className="mt-2 space-y-1">
                        <Link className="block hover:text-[#202124]" to="/about">About Us</Link>
                        <Link className="block hover:text-[#202124]" to="/guide">Guide</Link>
                        <Link className="block hover:text-[#202124]" to="/contact">Contact Us</Link>
                    </div>
                </div>

                <div>
                    <p className="text-base font-semibold text-[#202124]">Legal</p>
                    <div className="mt-2 space-y-1">
                        <Link className="block hover:text-[#202124]" to="/privacy-policy">Privacy Policy</Link>
                        <Link className="block hover:text-[#202124]" to="/terms-and-conditions">Terms & Conditions</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
