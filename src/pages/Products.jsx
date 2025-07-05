import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ChevronDown, ChevronUp, X, Check } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { productsAPI } from '../services/api';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  
  // Get filter values from URL params
  const categoryParam = searchParams.get('category') || '';
  const brandParam = searchParams.get('brand') || '';
  const searchParam = searchParams.get('search') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const sortParam = searchParams.get('sort') || 'newest';

  // Fetch products and apply filters
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Prepare query parameters
        const params = {};
        if (categoryParam) params.category = categoryParam;
        if (brandParam) params.brand = brandParam;
        if (searchParam) params.search = searchParam;
        if (minPriceParam) params.minPrice = minPriceParam;
        if (maxPriceParam) params.maxPrice = maxPriceParam;
        if (sortParam) params.sort = sortParam;

        // Fetch products with filters
        const productsData = await productsAPI.getProducts(params);
        setProducts(productsData);

        // Extract unique brands from products for filter
        const uniqueBrands = [...new Set(productsData.map(product => product.brand))];
        setBrands(uniqueBrands);

        // Fetch categories
        const categoriesData = await productsAPI.getCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [categoryParam, brandParam, searchParam, minPriceParam, maxPriceParam, sortParam]);

  // Update URL params when filters change
  const updateFilters = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  // Handle price range input and filter
  const handlePriceRangeChange = (e, type) => {
    const value = e.target.value;
    setPriceRange({ ...priceRange, [type]: value });
  };

  const applyPriceRange = () => {
    if (priceRange.min) updateFilters('minPrice', priceRange.min);
    if (priceRange.max) updateFilters('maxPrice', priceRange.max);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchParams({});
    setPriceRange({ min: '', max: '' });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading products...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {categoryParam ? `${categoryParam}` : 'All Products'}
          </h1>
          <p className="text-gray-600">
            {products.length} {products.length === 1 ? 'product' : 'products'} available
          </p>
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 font-medium"
          >
            <Filter className="w-5 h-5" />
            <span>Filters & Sort</span>
          </button>
        </div>

        {/* Mobile Filters Overlay */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setMobileFiltersOpen(false)}></div>
            <div className="absolute inset-y-0 right-0 max-w-full flex">
              <div className="relative w-screen max-w-md">
                <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="p-4">
                    {/* Mobile Sort Options */}
                    <div className="mb-6">
                      <h3 className="text-md font-medium text-gray-900 mb-3">Sort By</h3>
                      <div className="space-y-2">
                        {['newest', 'price-asc', 'price-desc', 'rating-desc'].map((option) => {
                          const labels = {
                            'newest': 'Newest Arrivals',
                            'price-asc': 'Price: Low to High',
                            'price-desc': 'Price: High to Low',
                            'rating-desc': 'Best Rating'
                          };
                          return (
                            <div key={option} className="flex items-center">
                              <input
                                type="radio"
                                id={`mobile-sort-${option}`}
                                name="mobile-sort"
                                checked={sortParam === option}
                                onChange={() => updateFilters('sort', option)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`mobile-sort-${option}`} className="ml-3 text-sm text-gray-700">
                                {labels[option]}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Mobile Category Filter */}
                    <div className="mb-6">
                      <h3 className="text-md font-medium text-gray-900 mb-3">Categories</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {categories.map((category) => (
                          <div key={category._id} className="flex items-center">
                            <input
                              type="radio"
                              id={`mobile-category-${category.name}`}
                              name="mobile-category"
                              checked={categoryParam === category.name}
                              onChange={() => updateFilters('category', category.name)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`mobile-category-${category.name}`} className="ml-3 text-sm text-gray-700">
                              {category.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Brand Filter */}
                    <div className="mb-6">
                      <h3 className="text-md font-medium text-gray-900 mb-3">Brands</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {brands.map((brand) => (
                          <div key={brand} className="flex items-center">
                            <input
                              type="radio"
                              id={`mobile-brand-${brand}`}
                              name="mobile-brand"
                              checked={brandParam === brand}
                              onChange={() => updateFilters('brand', brand)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`mobile-brand-${brand}`} className="ml-3 text-sm text-gray-700">
                              {brand}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Price Range */}
                    <div className="mb-6">
                      <h3 className="text-md font-medium text-gray-900 mb-3">Price Range</h3>
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            placeholder="Min"
                            value={priceRange.min}
                            onChange={(e) => handlePriceRangeChange(e, 'min')}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-3 py-2 sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        <span className="text-gray-500">to</span>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            placeholder="Max"
                            value={priceRange.max}
                            onChange={(e) => handlePriceRangeChange(e, 'max')}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-3 py-2 sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      <button
                        onClick={applyPriceRange}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Apply Price Range
                      </button>
                    </div>

                    {/* Clear All Filters */}
                    <button
                      onClick={clearAllFilters}
                      className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-24">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-medium text-lg text-gray-900 flex items-center">
                  <SlidersHorizontal className="w-5 h-5 mr-2" />
                  Filters
                </h2>
                <button
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {filtersOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {filtersOpen && (
                <div className="p-4 space-y-6">
                  {/* Sort Options */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Sort By</h3>
                    <div className="space-y-2">
                      {['newest', 'price-asc', 'price-desc', 'rating-desc'].map((option) => {
                        const labels = {
                          'newest': 'Newest Arrivals',
                          'price-asc': 'Price: Low to High',
                          'price-desc': 'Price: High to Low',
                          'rating-desc': 'Best Rating'
                        };
                        return (
                          <div key={option} className="flex items-center">
                            <input
                              type="radio"
                              id={`sort-${option}`}
                              name="sort"
                              checked={sortParam === option}
                              onChange={() => updateFilters('sort', option)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`sort-${option}`} className="ml-3 text-sm text-gray-700">
                              {labels[option]}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {categories.map((category) => (
                        <div key={category._id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`category-${category.name}`}
                            checked={categoryParam === category.name}
                            onChange={() => updateFilters('category', categoryParam === category.name ? '' : category.name)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`category-${category.name}`} className="ml-3 text-sm text-gray-700">
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Brand Filter */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Brands</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {brands.map((brand) => (
                        <div key={brand} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`brand-${brand}`}
                            checked={brandParam === brand}
                            onChange={() => updateFilters('brand', brandParam === brand ? '' : brand)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`brand-${brand}`} className="ml-3 text-sm text-gray-700">
                            {brand}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Price Range</h3>
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          placeholder="Min"
                          value={priceRange.min}
                          onChange={(e) => handlePriceRangeChange(e, 'min')}
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-3 py-2 sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      <span className="text-gray-500">to</span>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          placeholder="Max"
                          value={priceRange.max}
                          onChange={(e) => handlePriceRangeChange(e, 'max')}
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-3 py-2 sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    <button
                      onClick={applyPriceRange}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Apply
                    </button>
                  </div>

                  {/* Clear All Filters */}
                  <button
                    onClick={clearAllFilters}
                    className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Active Filters */}
            {(categoryParam || brandParam || minPriceParam || maxPriceParam) && (
              <div className="bg-white rounded-lg p-4 mb-6 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700 mr-2">Active Filters:</span>
                
                {categoryParam && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Category: {categoryParam}
                    <button 
                      onClick={() => updateFilters('category', '')}
                      className="ml-1 text-blue-500 hover:text-blue-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                )}
                
                {brandParam && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Brand: {brandParam}
                    <button 
                      onClick={() => updateFilters('brand', '')}
                      className="ml-1 text-blue-500 hover:text-blue-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                )}
                
                {(minPriceParam || maxPriceParam) && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Price: {minPriceParam ? `$${minPriceParam}` : '$0'} - {maxPriceParam ? `$${maxPriceParam}` : 'Any'}
                    <button 
                      onClick={() => {
                        updateFilters('minPrice', '');
                        updateFilters('maxPrice', '');
                        setPriceRange({ min: '', max: '' });
                      }}
                      className="ml-1 text-blue-500 hover:text-blue-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                )}
                
                <button 
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium ml-auto"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Products */}
            {products.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="text-gray-500 text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search criteria.</p>
                <button 
                  onClick={clearAllFilters}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;