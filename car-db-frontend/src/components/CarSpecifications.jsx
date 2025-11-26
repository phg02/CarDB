const SpecItem = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-gray-700 last:border-0">
    <span className="text-gray-400 text-sm">{label}</span>
    <span className="text-white text-sm font-medium">{value}</span>
  </div>
);

const CarSpecifications = ({ specifications }) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
        {/* Left Column */}
        <div className="space-y-8">
          {specifications.leftColumn.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-lg font-semibold text-white mb-4">{section.title}</h3>
              <div className="space-y-1">
                {section.items.map((item, itemIdx) => (
                  <SpecItem key={itemIdx} label={item.label} value={item.value} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {specifications.rightColumn.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-lg font-semibold text-white mb-4">{section.title}</h3>
              <div className="space-y-1">
                {section.items.map((item, itemIdx) => (
                  <SpecItem key={itemIdx} label={item.label} value={item.value} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CarSpecifications;
