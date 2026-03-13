import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

export default function ProductForm({ form, onChange, onSubmit, loading }) {
    return (
        <form
            onSubmit={onSubmit}
            className="grid gap-3 rounded-xl border border-[#edf0f7] p-4 md:grid-cols-3"
        >
            <Input label="Name" name="name" value={form.name} onChange={onChange} required />

            <Input
                label="Description"
                name="description"
                value={form.description}
                onChange={onChange}
                required
            />

            <Input
                label="Price"
                name="price"
                type="number"
                value={form.price}
                onChange={onChange}
                required
            />

            <div className="md:col-span-3">
                <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Product"}
                </Button>
            </div>
        </form>
    );
}