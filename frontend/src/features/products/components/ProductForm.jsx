import { useState } from "react";
import { useProducts } from "../productSlice";

export default function ProductForm() {

    const { createProduct } = useProducts();

    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            await createProduct(form);

            setForm({
                name: "",
                description: "",
                price: "",
            });

            alert("Product created successfully");

        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={submitHandler} className="product-form">

            <h3>Create Product</h3>

            <input
                name="name"
                placeholder="Product name"
                value={form.name}
                onChange={handleChange}
                required
            />

            <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                required
            />

            <input
                type="number"
                name="price"
                placeholder="Price"
                value={form.price}
                onChange={handleChange}
                required
            />

            <button disabled={loading}>
                {loading ? "Creating..." : "Create Product"}
            </button>

        </form>
    );
}