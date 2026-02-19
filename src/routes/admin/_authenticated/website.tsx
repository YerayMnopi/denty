import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { mockWebsites, type MockWebsite } from '@/data/website-mock'
import { AdminLayout } from '@/components/admin/admin-layout'

// Mock server function to get website data
const getWebsiteData = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ clinicId: z.string() }))
  .handler(async ({ data }): Promise<MockWebsite | null> => {
    const website = mockWebsites.find(w => w.clinicId === data.clinicId)
    return website || null
  })

// Mock server function to update website
const updateWebsiteData = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    websiteId: z.string(),
    updates: z.object({
      settings: z.object({
        name: z.record(z.string()).optional(),
        theme: z.object({
          primaryColor: z.string().optional(),
          secondaryColor: z.string().optional(),
          logo: z.string().optional(),
        }).optional(),
        pages: z.object({
          homepage: z.boolean().optional(),
          services: z.boolean().optional(),
          team: z.boolean().optional(),
          contact: z.boolean().optional(),
          blog: z.boolean().optional(),
        }).optional(),
        seo: z.object({
          title: z.record(z.string()).optional(),
          description: z.record(z.string()).optional(),
          keywords: z.array(z.string()).optional(),
        }).optional(),
      }).optional(),
      content: z.object({
        homepage: z.object({
          hero: z.record(z.string()).optional(),
          about: z.record(z.string()).optional(),
          callToAction: z.record(z.string()).optional(),
        }).optional(),
      }).optional(),
    }),
  }))
  .handler(async ({ data }) => {
    // In a real implementation, this would update the database
    console.log('Updating website:', data)
    return { success: true }
  })

export const Route = createFileRoute('/admin/_authenticated/website')({
  loader: async () => {
    // Mock clinic ID - in real implementation, get from auth context
    const clinicId = '507f1f77bcf86cd799439011'
    const website = await getWebsiteData({ data: { clinicId } })
    return { website, clinicId }
  },
  component: WebsiteManagement,
})

function WebsiteManagement() {
  const { website } = Route.useLoaderData()
  
  const [activeTab, setActiveTab] = useState('general')
  const [formData, setFormData] = useState<Record<string, any>>(website || {
    settings: {
      name: { en: '', es: '' },
      theme: {
        primaryColor: '#2563eb',
        secondaryColor: '#06b6d4',
        logo: '',
        favicon: '',
      },
      pages: {
        homepage: true,
        services: true,
        team: true,
        contact: true,
        blog: true,
      },
      seo: {
        title: { en: '', es: '' },
        description: { en: '', es: '' },
        keywords: [] as string[],
      },
    },
    content: {
      homepage: {
        hero: { en: '', es: '' },
        about: { en: '', es: '' },
        callToAction: { en: '', es: '' },
      },
    },
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!website) return
    
    setIsSaving(true)
    try {
      await updateWebsiteData({
        data: {
          websiteId: website._id,
          updates: {
            settings: formData.settings,
            content: formData.content,
          },
        }
      })
      // Show success message
      alert('Website updated successfully!')
    } catch (error) {
      console.error('Error updating website:', error)
      alert('Error updating website')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreview = () => {
    if (website) {
      const url = `/clinic/${website.subdomain}`
      window.open(url, '_blank')
    }
  }

  const tabs = [
    { id: 'general', name: 'General Settings', icon: '⚙️' },
    { id: 'pages', name: 'Pages', icon: '📄' },
    { id: 'seo', name: 'SEO', icon: '🔍' },
    { id: 'blog', name: 'Blog', icon: '📝' },
  ]

  return (
    <AdminLayout>
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Website Management</h1>
            <p className="text-gray-600 mt-2">
              Manage your clinic's website content and settings
            </p>
          </div>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={handlePreview}
              disabled={!website}
            >
              👁️ Preview Website
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!website || isSaving}
            >
              {isSaving ? 'Saving...' : '💾 Save Changes'}
            </Button>
          </div>
        </div>
        
        {website && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Website URL:</strong>{' '}
              <a 
                href={`/clinic/${website.subdomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-900"
              >
                {website.domain || `${website.subdomain}.denty.es`}
              </a>
            </p>
          </div>
        )}
      </div>

      {!website ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">🌐</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Website Found</h2>
          <p className="text-gray-600 mb-6">
            You don't have a website set up yet. Create one to start building your online presence.
          </p>
          <Button onClick={() => {/* Navigate to create website */}}>
            Create Website
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sticky top-4">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-6">General Settings</h2>
                  
                  <div className="space-y-6">
                    {/* Website Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website Name
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">English</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            value={formData.settings?.name?.en || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              settings: {
                                ...prev.settings,
                                name: { ...prev.settings?.name, en: e.target.value }
                              }
                            }))}
                            placeholder="Dental Clinic Name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Spanish</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            value={formData.settings?.name?.es || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              settings: {
                                ...prev.settings,
                                name: { ...prev.settings?.name, es: e.target.value }
                              }
                            }))}
                            placeholder="Nombre de la Clínica Dental"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Theme Colors */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Theme Colors
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Primary Color</label>
                          <input
                            type="color"
                            className="w-full h-10 border border-gray-300 rounded-md"
                            value={formData.settings?.theme?.primaryColor || '#2563eb'}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              settings: {
                                ...prev.settings,
                                theme: { ...prev.settings?.theme, primaryColor: e.target.value }
                              }
                            }))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Secondary Color</label>
                          <input
                            type="color"
                            className="w-full h-10 border border-gray-300 rounded-md"
                            value={formData.settings?.theme?.secondaryColor || '#06b6d4'}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              settings: {
                                ...prev.settings,
                                theme: { ...prev.settings?.theme, secondaryColor: e.target.value }
                              }
                            }))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Logo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo URL
                      </label>
                      <input
                        type="url"
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        value={formData.settings?.theme?.logo || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            theme: { ...prev.settings?.theme, logo: e.target.value }
                          }
                        }))}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>

                    {/* Homepage Content */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Homepage Content</h3>
                      
                      {/* Hero Section */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hero Title
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">English</label>
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded-md px-3 py-2"
                              value={formData.content?.homepage?.hero?.en || ''}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                content: {
                                  ...prev.content,
                                  homepage: {
                                    ...prev.content?.homepage,
                                    hero: { ...prev.content?.homepage?.hero, en: e.target.value }
                                  }
                                }
                              }))}
                              placeholder="Your Smile, Our Passion"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Spanish</label>
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded-md px-3 py-2"
                              value={formData.content?.homepage?.hero?.es || ''}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                content: {
                                  ...prev.content,
                                  homepage: {
                                    ...prev.content?.homepage,
                                    hero: { ...prev.content?.homepage?.hero, es: e.target.value }
                                  }
                                }
                              }))}
                              placeholder="Tu Sonrisa, Nuestra Pasión"
                            />
                          </div>
                        </div>
                      </div>

                      {/* About Section */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          About Description
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">English</label>
                            <textarea
                              className="w-full border border-gray-300 rounded-md px-3 py-2"
                              rows={3}
                              value={formData.content?.homepage?.about?.en || ''}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                content: {
                                  ...prev.content,
                                  homepage: {
                                    ...prev.content?.homepage,
                                    about: { ...prev.content?.homepage?.about, en: e.target.value }
                                  }
                                }
                              }))}
                              placeholder="Describe your clinic..."
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Spanish</label>
                            <textarea
                              className="w-full border border-gray-300 rounded-md px-3 py-2"
                              rows={3}
                              value={formData.content?.homepage?.about?.es || ''}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                content: {
                                  ...prev.content,
                                  homepage: {
                                    ...prev.content?.homepage,
                                    about: { ...prev.content?.homepage?.about, es: e.target.value }
                                  }
                                }
                              }))}
                              placeholder="Describe tu clínica..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pages Settings */}
              {activeTab === 'pages' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-6">Page Settings</h2>
                  
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Choose which pages to include on your website. Disabled pages won't be accessible to visitors.
                    </p>

                    {Object.entries(formData.settings?.pages || {}).map(([pageKey, enabled]) => (
                      <div key={pageKey} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium capitalize">
                            {pageKey === 'homepage' ? 'Homepage' : pageKey} Page
                          </h3>
                          <p className="text-sm text-gray-600">
                            {pageKey === 'homepage' && 'Main landing page with hero section and overview'}
                            {pageKey === 'services' && 'Detailed list of all your dental services'}
                            {pageKey === 'team' && 'Meet the team - doctors and staff profiles'}
                            {pageKey === 'contact' && 'Contact information and location details'}
                            {pageKey === 'blog' && 'Blog posts and dental health articles'}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            checked={enabled as boolean}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              settings: {
                                ...prev.settings,
                                pages: { ...prev.settings?.pages, [pageKey]: e.target.checked }
                              }
                            }))}
                            disabled={pageKey === 'homepage'} // Homepage is always required
                          />
                          <label className="ml-2 text-sm text-gray-700">
                            {enabled ? 'Enabled' : 'Disabled'}
                          </label>
                        </div>
                      </div>
                    ))}

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">Note</h3>
                          <p className="mt-1 text-sm text-yellow-700">
                            The homepage cannot be disabled as it's the main entry point for your website.
                            Disabled pages will return a 404 error when accessed.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SEO Settings */}
              {activeTab === 'seo' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-6">SEO Settings</h2>
                  
                  <div className="space-y-6">
                    {/* Meta Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Title
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">English</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            value={formData.settings?.seo?.title?.en || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              settings: {
                                ...prev.settings,
                                seo: { ...prev.settings?.seo, title: { ...prev.settings?.seo?.title, en: e.target.value } }
                              }
                            }))}
                            placeholder="Best Dental Clinic in Your City"
                            maxLength={60}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {(formData.settings?.seo?.title?.en || '').length}/60 characters
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Spanish</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            value={formData.settings?.seo?.title?.es || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              settings: {
                                ...prev.settings,
                                seo: { ...prev.settings?.seo, title: { ...prev.settings?.seo?.title, es: e.target.value } }
                              }
                            }))}
                            placeholder="Mejor Clínica Dental en Tu Ciudad"
                            maxLength={60}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {(formData.settings?.seo?.title?.es || '').length}/60 characters
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Meta Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Description
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">English</label>
                          <textarea
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            rows={3}
                            value={formData.settings?.seo?.description?.en || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              settings: {
                                ...prev.settings,
                                seo: { ...prev.settings?.seo, description: { ...prev.settings?.seo?.description, en: e.target.value } }
                              }
                            }))}
                            placeholder="Professional dental care with modern technology and experienced dentists..."
                            maxLength={160}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {(formData.settings?.seo?.description?.en || '').length}/160 characters
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Spanish</label>
                          <textarea
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            rows={3}
                            value={formData.settings?.seo?.description?.es || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              settings: {
                                ...prev.settings,
                                seo: { ...prev.settings?.seo, description: { ...prev.settings?.seo?.description, es: e.target.value } }
                              }
                            }))}
                            placeholder="Cuidado dental profesional con tecnología moderna y dentistas experimentados..."
                            maxLength={160}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {(formData.settings?.seo?.description?.es || '').length}/160 characters
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Keywords */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SEO Keywords
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        value={(formData.settings?.seo?.keywords || []).join(', ')}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            seo: { ...prev.settings?.seo, keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) }
                          }
                        }))}
                        placeholder="dentist, dental clinic, teeth cleaning, dental implants"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Separate keywords with commas. Focus on 5-10 relevant terms.
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="shrink-0">
                          <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">SEO Tips</h3>
                          <div className="mt-1 text-sm text-blue-700">
                            <ul className="list-disc list-inside space-y-1">
                              <li>Keep titles under 60 characters for best display in search results</li>
                              <li>Write compelling descriptions under 160 characters</li>
                              <li>Include your location and main services in keywords</li>
                              <li>Use natural language that your patients would search for</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Blog Management */}
              {activeTab === 'blog' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-6">Blog Management</h2>
                  
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <p className="text-gray-600">
                        Manage your blog posts and content to improve SEO and engage visitors.
                      </p>
                      <Button 
                        disabled
                        title="Coming soon"
                      >
                        📝 New Blog Post
                      </Button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <div className="text-4xl mb-4">📝</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Blog Management</h3>
                      <p className="text-gray-600 mb-4">
                        Blog functionality will be available here. You'll be able to create, edit, and manage blog posts.
                      </p>
                      <div className="space-y-2 text-sm text-gray-500">
                        <p>• Create and edit blog posts</p>
                        <p>• Manage categories and tags</p>
                        <p>• Schedule posts for future publication</p>
                        <p>• Monitor post performance</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  )
}

export default WebsiteManagement