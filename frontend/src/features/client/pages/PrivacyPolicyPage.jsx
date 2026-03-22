export default function PrivacyPolicyPage() {
    return (
        <div className="mx-auto w-full max-w-[900px] px-4 py-8 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-[#d9e2ec] bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-semibold text-[#202124]">Privacy Policy</h1>
                <p className="mt-3 text-sm leading-7 text-[#5f6368]">
                    We store account and order details only to process purchases, delivery, and support.
                    Sensitive payment data is not stored because checkout is cash on delivery.
                </p>
            </div>
        </div>
    );
}
