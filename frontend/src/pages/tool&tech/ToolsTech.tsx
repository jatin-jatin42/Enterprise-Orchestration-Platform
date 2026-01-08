
import React, { useState, useEffect, useMemo } from "react";
import { Plus, ExternalLink, Edit, Trash, X, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import toolService from "../../services/toolService";
import type { Tool } from "../../services/toolService";
import type { CreateToolData } from "../../services/toolService";
import type { UpdateToolData } from "../../services/toolService";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";

const categories = ["Frontend", "Backend", "DevOps", "Database", "Design", "Testing", "Mobile", "AI/ML"];
const pricingOptions = ["Open Source", "Freemium", "Free", "Paid", "Enterprise"];

// Mock admin check - replace with your actual authentication logic
const isAdmin = true; // Change this based on your auth system

const ToolsTech: React.FC = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    toolName: "",
    description: "",
    category: "",
    pricing: "",
    officialUrl: "",
    rating: 5,
    documentationUrl: "",
    tags: ""
  });

  // Load tools on component mount and when filters change
  useEffect(() => {
    loadTools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category]);

  const loadTools = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (search) filters.search = search;
      if (category !== 'All Categories') filters.category = category;
      
      const response = await toolService.getAllTools(filters);
      if (response.success) {
        setTools(response.data);
      } else {
        toast.error('Failed to load tools');
      }
    } catch (error) {
      console.error('Error loading tools:', error);
      toast.error('Failed to load tools');
    } finally {
      setLoading(false);
    }
  };

  const filteredTools = tools; // Now handled by backend

  // Stats calculations
  const stats = useMemo(() => {
    const total = tools.length;
    const frontend = tools.filter(t => t.category === 'Frontend').length;
    const backend = tools.filter(t => t.category === 'Backend').length;
    const devops = tools.filter(t => t.category === 'DevOps').length;
    const others = total - (frontend + backend + devops);

    return { total, frontend, backend, devops, others };
  }, [tools]);


  // Open create modal
  const handleCreateClick = () => {
    setEditingTool(null);
    setFormData({
      toolName: "",
      description: "",
      category: "",
      pricing: "",
      officialUrl: "",
      rating: 5,
      documentationUrl: "",
      tags: ""
    });
    setIsModalOpen(true);
  };

  // Open edit modal with tool data
  const handleEditClick = (tool: Tool) => {
    setEditingTool(tool);
    setFormData({
      toolName: tool.toolName,
      description: tool.description,
      category: tool.category,
      pricing: tool.pricing,
      officialUrl: tool.officialUrl,
      rating: tool.rating,
      documentationUrl: tool.documentationUrl || "",
      tags: tool.tags.join(", ")
    });
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTool(null);
    setFormData({
      toolName: "",
      description: "",
      category: "",
      pricing: "",
      officialUrl: "",
      rating: 5,
      documentationUrl: "",
      tags: ""
    });
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }));
  };

  // Handle form submission for both create and edit
  const handleSaveTool = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (editingTool) {
        // Update existing tool
        const response = await toolService.updateTool(editingTool._id!, formData as UpdateToolData);
        if (response.success) {
          toast.success('Tool updated successfully!');
          setTools(tools.map(tool => 
            tool._id === editingTool._id ? response.data : tool
          ));
        } else {
          toast.error('Failed to update tool');
        }
      } else {
        // Create new tool
        const response = await toolService.createTool(formData as CreateToolData);
        if (response.success) {
          toast.success('Tool created successfully!');
          setTools([...tools, response.data]);
        } else {
          toast.error('Failed to create tool');
        }
      }
      
      // Close the modal
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving tool:', error);
      toast.error(error.response?.data?.message || 'Failed to save tool');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete tool
  const handleDeleteTool = async (toolId: string, toolName: string) => {
    if (window.confirm(`Are you sure you want to delete "${toolName}"?`)) {
      try {
        const response = await toolService.deleteTool(toolId);
        if (response.success) {
          toast.success('Tool deleted successfully!');
          setTools(tools.filter(tool => tool._id !== toolId));
        } else {
          toast.error('Failed to delete tool');
        }
      } catch (error: any) {
        console.error('Error deleting tool:', error);
        toast.error(error.response?.data?.message || 'Failed to delete tool');
      }
    }
  };

  const modalTitle = editingTool ? "Edit Tool" : "Create New Tool";
  const saveButtonText = editingTool ? "Save Changes" : "Create Tool";

  const getCategoryColor = (cat: string) => {
    switch (cat) {
        case 'Frontend': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
        case 'Backend': return 'bg-green-500/20 text-green-400 border border-green-500/30';
        case 'DevOps': return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
        default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 p-6 overflow-hidden gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">Tools & Tech Resources</h1>
          <p className="text-gray-400 text-sm">
            Manage your development tools, libraries, and technologies
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 shrink-0">
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-sm">
          <p className="text-gray-400 text-xs font-medium">Total Tools</p>
          <p className="text-xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-sm">
          <p className="text-gray-400 text-xs font-medium">Frontend</p>
          <p className="text-xl font-bold text-white mt-1">{stats.frontend}</p>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-sm">
          <p className="text-gray-400 text-xs font-medium">Backend</p>
          <p className="text-xl font-bold text-white mt-1">{stats.backend}</p>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-sm">
          <p className="text-gray-400 text-xs font-medium">DevOps</p>
          <p className="text-xl font-bold text-white mt-1">{stats.devops}</p>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-sm">
          <p className="text-gray-400 text-xs font-medium">Others</p>
          <p className="text-xl font-bold text-white mt-1">{stats.others}</p>
        </div>
      </div>

      {/* Filters Row */}
      <div className="section-actions shadow-sm shrink-0">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 xl:gap-8 justify-between items-start lg:items-center">
            <div className="search-filter flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search tools..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-white placeholder-gray-400"
                    />
                </div>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-white min-w-[140px]"
                >
                    <option value="All Categories">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>
            {isAdmin && (
                <button 
                  onClick={handleCreateClick}
                  className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors flex items-center gap-2 min-w-[140px] justify-center"
                >
                  <Plus size={18} />
                  Add Tool
                </button>
            )}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="rounded-lg overflow-y-auto flex-1 min-h-0">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-400 text-lg">Loading tools...</span>
          </div>
        ) : (
          <>
             <div className="p-1">
                {filteredTools.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                        {filteredTools.map((tool) => (
                             <div
                             key={tool._id}
                             className="project-card bg-gray-800 border border-gray-700 rounded-lg transition-all duration-300 hover:shadow-xl hover:shadow-indigo-900/20 hover:border-indigo-500/50 hover:scale-[1.02] hover:bg-gray-750 flex flex-col"
                           >
                            {/* Card Header */}
                            <div className="p-4 md:p-6 border-b border-gray-700">
                                <div className="flex justify-between items-center mb-3">
                                     <span className={`status px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(tool.category)}`}>
                                        {tool.category}
                                     </span>
                                     <div className="text-yellow-400 text-xs">
                                        {"★".repeat(tool.rating)}{"☆".repeat(5 - tool.rating)}
                                     </div>
                                </div>
                                <h2 className="text-lg md:text-xl font-bold text-white truncate" title={tool.toolName}>
                                    {tool.toolName}
                                </h2>
                                <p className="text-sm text-gray-400 h-10 mt-2 line-clamp-2">
                                    {tool.description || 'No description available.'}
                                </p>
                            </div>

                            {/* Card Body */}
                            <div className="p-4 md:p-6 flex-1">
                                <div className="mb-4">
                                     <div className="flex justify-between items-center mb-2">
                                        <strong className="text-xs md:text-sm text-gray-400">Pricing</strong>
                                        <span className="text-white text-sm bg-gray-700 px-2 py-0.5 rounded-full">{tool.pricing}</span>
                                     </div>
                                     <strong className="block text-xs md:text-sm text-gray-400 mb-2">Tags</strong>
                                     <div className="flex flex-wrap gap-2">
                                        {tool.tags.slice(0, 3).map((tag) => (
                                            <span
                                                key={tag}
                                                className="bg-gray-700 text-gray-300 px-2.5 py-0.5 rounded-full text-xs"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        {tool.tags.length > 3 && (
                                            <span className="bg-gray-600 text-gray-200 px-2.5 py-0.5 rounded-full text-xs">
                                                +{tool.tags.length - 3}
                                            </span>
                                        )}
                                     </div>
                                </div>
                            </div>
                            
                            {/* Card Actions */}
                            <div className="p-4 border-t border-gray-700 mt-auto">
                                <div className="flex gap-2">
                                    <a
                                        href={tool.officialUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 bg-gray-700 text-gray-300 px-2 py-1.5 rounded text-xs xl:text-sm font-medium hover:bg-gray-600 transition-colors text-center flex items-center justify-center gap-1"
                                    >
                                        <ExternalLink size={14} /> Visit
                                    </a>
                                    {isAdmin && (
                                        <>
                                            <button 
                                                onClick={() => handleEditClick(tool)}
                                                className="flex-1 bg-gray-700 text-gray-300 px-2 py-1.5 rounded text-xs xl:text-sm font-medium hover:bg-indigo-600/20 hover:text-indigo-400 transition-colors flex items-center justify-center gap-1"
                                            >
                                                <Edit size={14} /> Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteTool(tool._id!, tool.toolName)}
                                                className="flex-1 bg-gray-700 text-gray-300 px-2 py-1.5 rounded text-xs xl:text-sm font-medium hover:bg-red-600/20 hover:text-red-400 transition-colors flex items-center justify-center gap-1"
                                            >
                                                <Trash size={14} /> Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                           </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <h3 className="text-xl font-semibold text-white mb-3">
                            {search || category !== 'All Categories' ? 'No matching tools found' : 'No tools found'}
                        </h3>
                        <p className="text-gray-400 text-lg mb-6 max-w-md mx-auto">
                            {search || category !== 'All Categories' ? 'Try adjusting your search criteria.' : 'Start adding tools to your collection.'}
                        </p>
                        {isAdmin && (
                            <button
                                onClick={handleCreateClick}
                                className="bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors inline-flex items-center gap-2 text-lg font-medium"
                            >
                                <Plus size={20} />
                                Add Your First Tool
                            </button>
                        )}
                    </div>
                )}
             </div>
          </>
        )}
      </div>


      {/* Create/Edit Tool Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
          <div className="relative w-full max-w-2xl bg-gray-800 text-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto border border-gray-700">
            {/* Modal Header */}
             <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-2xl font-bold">{modalTitle}</h2>
                 <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveTool}>
              <div className="p-6 space-y-6">
                {/* Tool Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Tool Name *
                  </label>
                  <input
                    type="text"
                    name="toolName"
                    value={formData.toolName}
                    onChange={handleInputChange}
                    required
                    disabled={formLoading}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                    placeholder="Enter tool name"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    disabled={formLoading}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                    placeholder="Enter tool description"
                  />
                </div>

                {/* Category and Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      disabled={formLoading}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Pricing
                    </label>
                    <select
                      name="pricing"
                      value={formData.pricing}
                      onChange={handleInputChange}
                      disabled={formLoading}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                    >
                      <option value="">Select Pricing</option>
                      {pricingOptions.map((price) => (
                        <option key={price} value={price}>{price}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* URLs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Official URL *
                    </label>
                    <input
                      type="url"
                      name="officialUrl"
                      value={formData.officialUrl}
                      onChange={handleInputChange}
                      required
                      disabled={formLoading}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Documentation URL
                    </label>
                    <input
                      type="url"
                      name="documentationUrl"
                      value={formData.documentationUrl}
                      onChange={handleInputChange}
                      disabled={formLoading}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                      placeholder="https://docs.example.com"
                    />
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Rating ({formData.rating}/5)
                  </label>
                  <input
                    type="range"
                    name="rating"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={handleInputChange}
                    disabled={formLoading}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50 accent-indigo-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1 ★</span>
                    <span>2 ★★</span>
                    <span>3 ★★★</span>
                    <span>4 ★★★★</span>
                    <span>5 ★★★★★</span>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    disabled={formLoading}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>

               {/* Footer */}
               <div className="bg-gray-700 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={formLoading}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-500 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center justify-center min-w-[120px]"
                >
                  {formLoading && (
                    <LoadingSpinner size="sm" className="mr-2" />
                  )}
                  {saveButtonText}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolsTech;