import Button from "./Button";
import { Card } from "./Card";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const AddCarCard = ({ onAddCar }) => {
  return (
    <Card className="overflow-hidden border-gray-700 border-dashed bg-gray-800/50 flex items-center justify-center min-h-[400px]">
      <div className="text-center p-8">
        <div className="w-16 h-16 rounded-full bg-gray-900/80 flex items-center justify-center mx-auto mb-4">
          <Plus className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Add to Compare</h3>
        <p className="text-sm text-gray-400 mb-4">
          Select a vehicle from the car listing to compare
        </p>
        <Link to="/newcar">
          <Button 
            variant="outline" 
            className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Choose Car
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default AddCarCard;
