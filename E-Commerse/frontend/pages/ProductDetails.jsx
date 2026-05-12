import {Link} from "react-router-dom";
function ProductDetail({product}) {
const baseUrl=import.meta.env.VITE_DJANGO_BASE_URL;
return (
    <Link to={`/products/${product.id}`} className="block bg-white rounded-xl shodow-md hover:shadow-lg hover:scale-[1.02] transition-transform p-4 cursor-pointer">
        <img src={`${baseUrl}${product.image}`} alt={product.name} className="w-full h-56 object-cover rounded-lg mb-4"/>
        <h2 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h2>
        <p className="text-gray-600 font-medium">${product.price}</p>
        <p className="text-gray-500 mt-2">{product.description}</p>
    </Link>
)
}
export default ProductDetail;