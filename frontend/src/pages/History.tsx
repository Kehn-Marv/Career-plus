import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useHistoryStore, historySelectors, type SortOption } from '@/store/history-store'
import { getStorageInfo, exportData, importData } from '@/lib/db'
import { Search, Trash2, Download, Eye, Calendar, TrendingUp, Filter, X } from 'lucide-react'

export default function History() {
  const navigate = useNavigate()
  
  // Store state
  const {
    filteredAnalyses,
    isLoading,
    error,
    sortBy,
    filters,
    selectedAnalysisIds,
    loadHistory,
    deleteAnalysis,
    deleteMultiple,
    clearAll,
    setSortBy,
    setFilters,
    clearFilters,
    toggleSelection,
    selectAll,
    deselectAll
  } = useHistoryStore()
  
  // Local state
  const [storageInfo, setStorageInfo] = useState({ usage: 0, quota: 0, percentage: 0 })
  const [showFilters, setShowFilters] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<'single' | 'multiple' | 'all' | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  
  // Computed values
  const totalCount = useHistoryStore(historySelectors.getTotalCount)
  const filteredCount = useHistoryStore(historySelectors.getFilteredCount)
  const hasActiveFilters = useHistoryStore(historySelectors.hasActiveFilters)
  const selectedCount = useHistoryStore(historySelectors.getSelectedCount)
  const isAllSelected = useHistoryStore(historySelectors.isAllSelected)
  const averageScore = useHistoryStore(historySelectors.getAverageScore)
  
  // Load history on mount
  useEffect(() => {
    loadHistory()
    updateStorageInfo()
  }, [loadHistory])
  
  // Update storage info
  const updateStorageInfo = async () => {
    const info = await getStorageInfo()
    setStorageInfo(info)
  }
  
  // Format bytes to readable size
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }
  
  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date)
  }
  
  // Handle view analysis
  const handleView = (id: number) => {
    navigate(`/analyze?analysisId=${id}`)
  }
  
  // Handle delete single
  const handleDeleteSingle = (id: number) => {
    setDeleteTarget('single')
    setDeleteId(id)
    setShowDeleteConfirm(true)
  }
  
  // Handle delete multiple
  const handleDeleteMultiple = () => {
    if (selectedCount === 0) return
    setDeleteTarget('multiple')
    setShowDeleteConfirm(true)
  }
  
  // Handle clear all
  const handleClearAll = () => {
    setDeleteTarget('all')
    setShowDeleteConfirm(true)
  }
  
  // Confirm delete
  const confirmDelete = async () => {
    if (deleteTarget === 'single' && deleteId) {
      await deleteAnalysis(deleteId)
    } else if (deleteTarget === 'multiple') {
      await deleteMultiple(selectedAnalysisIds)
    } else if (deleteTarget === 'all') {
      await clearAll()
    }
    
    setShowDeleteConfirm(false)
    setDeleteTarget(null)
    setDeleteId(null)
    await updateStorageInfo()
  }
  
  // Handle export
  const handleExport = async () => {
    try {
      const jsonData = await exportData()
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `career-plus-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error: any) {
      alert('Failed to export data: ' + error.message)
    }
  }
  
  // Handle import
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    try {
      const text = await file.text()
      await importData(text)
      await loadHistory()
      await updateStorageInfo()
      alert('Data imported successfully!')
    } catch (error: any) {
      alert('Failed to import data: ' + error.message)
    }
    
    // Reset file input
    event.target.value = ''
  }
  
  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-emerald-50/30">
      <Header />
      
      <main id="main-content" className="flex-1 container mx-auto px-4 py-12" role="main">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
            Your Analysis <span className="text-emerald-600">History</span>
          </h1>
        </div>
          
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Analyses</p>
                  <p className="text-3xl font-bold text-gray-900">{totalCount}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Average Score</p>
                  <p className="text-3xl font-bold text-gray-900">{averageScore}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Storage Used</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatBytes(storageInfo.usage)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {storageInfo.percentage.toFixed(1)}% of {formatBytes(storageInfo.quota)}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Download className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Search and Filter Bar */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm max-w-5xl mx-auto mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by job title, company, or resume..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters({ searchQuery: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>
              
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="score-desc">Highest Score</option>
                <option value="score-asc">Lowest Score</option>
                <option value="title">Job Title (A-Z)</option>
              </select>
              
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-3 border-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  hasActiveFilters
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 text-gray-700 hover:border-emerald-300'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="bg-emerald-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    !
                  </span>
                )}
              </button>
              
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 text-gray-600 hover:text-gray-900 font-semibold transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
            
            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.minScore || ''}
                    onChange={(e) => setFilters({ minScore: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.maxScore || ''}
                    onChange={(e) => setFilters({ maxScore: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="100"
                  />
                </div>
              </div>
            )}
          </div>
        
        {/* Hidden file input for import */}
        <input
          id="import-file"
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
        
        {/* Selection Controls */}
        {filteredCount > 0 && (
          <div className="mb-6 flex items-center justify-between max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
              <button
                onClick={() => isAllSelected ? deselectAll() : selectAll()}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                {isAllSelected ? 'Deselect All' : 'Select All'}
              </button>
              {selectedCount > 0 && (
                <span className="text-sm text-gray-600 font-medium">
                  {selectedCount} selected
                </span>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-medium hover:border-emerald-300 hover:shadow-md transition-all flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              
              <button
                onClick={() => document.getElementById('import-file')?.click()}
                className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-medium hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4 rotate-180" />
                Import
              </button>
              
              {selectedCount > 0 && (
                <button
                  onClick={handleDeleteMultiple}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete {selectedCount}
                </button>
              )}
              
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-white border-2 border-red-200 text-red-700 rounded-lg font-medium hover:border-red-300 hover:shadow-md transition-all flex items-center gap-2 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        {/* Loading State */}
        {isLoading && (
          <div className="max-w-5xl mx-auto mt-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-6"></div>
              <p className="text-lg font-medium text-gray-900 mb-2">Loading History</p>
              <p className="text-gray-600">Please wait while we fetch your analyses...</p>
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {!isLoading && filteredCount === 0 && !hasActiveFilters && (
          <div className="max-w-5xl mx-auto mt-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Analyses Yet</h3>
              <p className="text-lg text-gray-600 mb-8">
                Start by analyzing your resume against a job description to see your compatibility score
              </p>
              <button
                onClick={() => navigate('/analyze')}
                className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-lg font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all"
              >
                Analyze Your Resume →
              </button>
            </div>
          </div>
        )}
        
        {/* No Results State */}
        {!isLoading && filteredCount === 0 && hasActiveFilters && (
          <div className="max-w-5xl mx-auto mt-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Results Found</h3>
              <p className="text-lg text-gray-600 mb-8">
                Try adjusting your filters or search query to find what you're looking for
              </p>
              <button
                onClick={clearFilters}
                className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-900 text-lg font-bold rounded-xl hover:border-emerald-300 hover:shadow-lg transition-all"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
        
        {/* Analysis List */}
        {!isLoading && filteredCount > 0 && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {filteredAnalyses.map((item) => (
              <div
                key={item.analysis.id}
                className={`bg-white rounded-2xl border-2 transition-all shadow-sm hover:shadow-lg ${
                  selectedAnalysisIds.includes(item.analysis.id!)
                    ? 'border-emerald-500 ring-4 ring-emerald-100'
                    : 'border-gray-200'
                }`}
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-start gap-6">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedAnalysisIds.includes(item.analysis.id!)}
                      onChange={() => toggleSelection(item.analysis.id!)}
                      className="mt-2 w-6 h-6 text-emerald-600 border-gray-300 rounded-lg focus:ring-emerald-500 cursor-pointer"
                    />
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {item.jobDescription.title}
                          </h3>
                          {item.jobDescription.company && (
                            <p className="text-lg text-gray-600">
                              {item.jobDescription.company}
                            </p>
                          )}
                        </div>
                        
                        {/* Score Badge */}
                        <div className={`px-6 py-3 rounded-xl font-bold text-2xl shadow-sm ${getScoreColor(item.analysis.scores.total)}`}>
                          {Math.round(item.analysis.scores.total)}
                        </div>
                      </div>
                      
                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-100">
                        <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                          <Calendar className="w-4 h-4" />
                          {formatDate(item.analysis.createdAt)}
                        </span>
                        <span className="bg-gray-50 px-3 py-1.5 rounded-lg">
                          📄 {item.resume.fileName}
                        </span>
                      </div>
                      
                      {/* Score Breakdown */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                          <p className="text-xs font-medium text-emerald-600 mb-1">Semantic</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {Math.round(item.analysis.scores.semantic)}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                          <p className="text-xs font-medium text-blue-600 mb-1">Keyword</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {Math.round(item.analysis.scores.keyword)}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                          <p className="text-xs font-medium text-purple-600 mb-1">Format</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {Math.round(item.analysis.scores.format)}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                          <p className="text-xs font-medium text-orange-600 mb-1">ATS</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {Math.round(item.analysis.scores.ats)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleView(item.analysis.id!)}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                        >
                          <Eye className="w-5 h-5" />
                          View Analysis
                        </button>
                        
                        <button
                          onClick={() => handleDeleteSingle(item.analysis.id!)}
                          className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-red-300 hover:text-red-600 transition-all flex items-center gap-2"
                        >
                          <Trash2 className="w-5 h-5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Storage Warning */}
        {storageInfo.percentage > 80 && (
          <div className="mt-8 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 max-w-5xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-amber-900 mb-2">Storage Warning</h3>
                <p className="text-amber-800 leading-relaxed">
                  You're using {storageInfo.percentage.toFixed(1)}% of your storage quota. 
                  Consider deleting old analyses to free up space.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Confirm Delete</h3>
            <p className="text-gray-600 mb-8 text-center leading-relaxed">
              {deleteTarget === 'single' && 'Are you sure you want to delete this analysis? This action cannot be undone.'}
              {deleteTarget === 'multiple' && `Are you sure you want to delete ${selectedCount} analyses? This action cannot be undone.`}
              {deleteTarget === 'all' && 'Are you sure you want to delete all analyses? This will permanently remove all your saved data.'}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeleteTarget(null)
                  setDeleteId(null)
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  )
}
