// src/components/admin/Card.jsx
const Card = ({ title, value, change, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          <p className={`text-sm mt-2 ${
            change.startsWith('+') ? 'text-green-500' : 'text-red-500'
          }`}>
            {change} from last month
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
          <span className="text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
  
  export default Card;