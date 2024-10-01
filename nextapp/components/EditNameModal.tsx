import React, { useState } from "react";

interface EditNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newName: string) => Promise<void>;
  currentName: string;
}

const EditNameModal: React.FC<EditNameModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentName,
}) => {
  const [name, setName] = useState(currentName);

  const handleSave = async () => {
    await onSave(name);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4 dark:text-white">
          Edit Display Name
        </h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded mb-4 dark:bg-gray-700 dark:text-white"
        />
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditNameModal;
