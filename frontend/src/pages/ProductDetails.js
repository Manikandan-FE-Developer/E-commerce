import { useEffect, useState } from "react"
import { useParams } from "react-router-dom";
import {toast} from "react-toastify";

export default function ProductDetails({cartItems, setCartItems}){
    const [isLoading, setIsLoading] = useState(true);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [product, setProduct] = useState(null);
    const [qty, setQty] = useState(1);
    const {id} = useParams();

    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        fetch(process.env.REACT_APP_API_URL+'/product/'+id)
        .then(res => res.json())
        .then(res => {
            setProduct(res.product);
            setIsLoading(false);
            const savedWishlist = JSON.parse(localStorage.getItem('wishlist'));
            if (savedWishlist && savedWishlist.includes(res.product._id)) {
                setIsInWishlist(true);
            }
        })    
    },[id])

    useEffect(() => {
        const savedWishlist = JSON.parse(localStorage.getItem('wishlist'));
        if (savedWishlist && savedWishlist.includes(product)) {
            setIsInWishlist(true);
        }
    }, [product]);

    const handleToggleWishlist = () => {
        const updatedWishlist = isInWishlist
            ? JSON.parse(localStorage.getItem('wishlist')).filter((itemId) => itemId !== product._id)
            : [...(JSON.parse(localStorage.getItem('wishlist')) || []), product._id];
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
        setIsInWishlist(!isInWishlist);
    };

    const formatPriceWithCommas = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    function addToCart(){
        const itemExist = cartItems.find((item) => item.product._id === product._id);
        if (!itemExist) {
            const newItem = { product, qty };
            setCartItems((prevCartItems) => {
                const updatedCart = [...prevCartItems, newItem];
                localStorage.setItem('cartItems', JSON.stringify(updatedCart));
                return updatedCart;
            });
            toast.success("Cart item added successfully");
        }
    }

    function increaseQty(){
        if (product.stock == qty) {
            return;
        }
        setQty((state) => state + 1);
    }

    function decreaseQty(){
        if (qty > 1) {
            setQty((state) => state - 1);
        }
    }

    return  isLoading ? ( 
                <img className="pdSpinner" src='/images/spinner.svg' alt='spinner'/> 
            ) : (
                product && ( 
                    <div className="container container-fluid">
                        <div className="row f-flex justify-content-around">
                            <div className="col-12 col-lg-5 img-fluid" id="product_image">
                                <div className="favIcon2" onClick={handleToggleWishlist}>
                                    <i className={`fa fa-heart${isInWishlist ? ' text-danger' : '-o'}`} />
                                </div>
                                <img src={product.image} alt="sdf" height="500" width="500"/> 
                            </div>
                            <div className="col-12 col-lg-5 mt-5">
                                <h3>{product.name}</h3>
                                <p id="product_id">Product # {product._id}</p>
                                <hr/>
                                <div className="rating-outer">
                                    <div className="rating-inner" style={{width : `${product.ratings/5*100}%`}}></div>
                                </div>
                                <hr/>
                                <p id="product_price">₹ {formatPriceWithCommas(product.price)}</p>
                                <div className="stockCounter d-inline">
                                    <span className="btn btn-danger minus" onClick={decreaseQty}>-</span>
                                    <input type="number" className="form-control count d-inline" value={qty} readOnly />
                                    <span className="btn btn-primary plus" onClick={increaseQty}>+</span>
                                </div>
                                <button type="button" id="cart_btn" className="btn btn-primary d-inline ml-4" disabled={product.stock == 0} onClick={addToCart}>
                                    Add to Cart
                                </button>
                                <hr/>
                                <p>Status: 
                                    <span id="stock_status" className={product.stock > 0 ? "text-success":"text-danger"}>
                                        {product.stock > 0 ? "In Stock":"Out of Stock"}
                                    </span>
                                </p>
                                <hr/>
                                <h4 className="mt-2">Description:</h4>
                                <p>{product.description}</p>
                                <hr/>
                                <p id="product_seller mb-3">Sold by: <strong>{product.seller}</strong></p>
                                <div className="rating w-50"></div>
                            </div>
                        </div>
                    </div>
                )
    );
}