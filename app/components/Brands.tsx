'use client';

export default function Brands() {
  const brands = [
    'Tesla', 'Apple', 'Microsoft', 'Amazon', 'Google', 
    'Meta', 'Netflix', 'Nike', 'Adidas', 'Samsung'
  ];

  return (
    <section className="w-full bg-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Başlık */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Birlikte Çalıştığımız Markalar
          </h2>
          <p className="text-lg text-gray-600">
            Dünya çapında tanınan markaların güvenini kazandık
          </p>
        </div>

        {/* Markalar Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {brands.map((brand, index) => (
            <div 
              key={index}
              className="flex items-center justify-center p-8 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all hover:shadow-md group"
            >
              <span className="text-2xl font-bold text-gray-400 group-hover:text-gray-600 transition-colors">
                {brand}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
