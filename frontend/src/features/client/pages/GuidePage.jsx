export default function GuidePage() {
    return (
        <div className="mx-auto w-full max-w-[900px] px-4 py-8 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-[#d9e2ec] bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-semibold text-[#202124]">Shopping Guide</h1>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7 text-[#5f6368]">
                    <li>Search products on the home page and add them to your cart.</li>
                    <li>Open Cart to review quantities and set your delivery location on map.</li>
                    <li>Login as USER to use loyalty points and place your order.</li>
                    <li>Track progress from My Orders and order tracking page.</li>
                </ol>
            </div>
        </div>
    );
}
