'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  MapPin,
  Building,
  Calendar,
  Users
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  department?: string;
  location?: string;
  createdAt: string;
  candidates?: any[];
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, departmentFilter, locationFilter]);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      if (response.ok) {
        const jobsData = await response.json();
        setJobs(jobsData);
      } else {
        // Fallback to mock data if API fails
        const mockJobs = [
          {
            id: '1',
            title: 'Senior Frontend Developer',
            department: 'Engineering',
            location: 'San Francisco, CA',
            createdAt: new Date().toISOString(),
            candidates: []
          },
          {
            id: '2',
            title: 'Product Manager',
            department: 'Product',
            location: 'New York, NY',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            candidates: []
          },
          {
            id: '3',
            title: 'UX Designer',
            department: 'Design',
            location: 'Remote',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            candidates: []
          },
          {
            id: '4',
            title: 'Backend Developer',
            department: 'Engineering',
            location: 'Austin, TX',
            createdAt: new Date(Date.now() - 259200000).toISOString(),
            candidates: []
          },
          {
            id: '5',
            title: 'Marketing Specialist',
            department: 'Marketing',
            location: 'Chicago, IL',
            createdAt: new Date(Date.now() - 345600000).toISOString(),
            candidates: []
          }
        ];
        setJobs(mockJobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // Use mock data as fallback
      const mockJobs = [
        {
          id: '1',
          title: 'Senior Frontend Developer',
          department: 'Engineering',
          location: 'San Francisco, CA',
          createdAt: new Date().toISOString(),
          candidates: []
        },
        {
          id: '2',
          title: 'Product Manager',
          department: 'Product',
          location: 'New York, NY',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          candidates: []
        },
        {
          id: '3',
          title: 'UX Designer',
          department: 'Design',
          location: 'Remote',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          candidates: []
        },
        {
          id: '4',
          title: 'Backend Developer',
          department: 'Engineering',
          location: 'Austin, TX',
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          candidates: []
        },
        {
          id: '5',
          title: 'Marketing Specialist',
          department: 'Marketing',
          location: 'Chicago, IL',
          createdAt: new Date(Date.now() - 345600000).toISOString(),
          candidates: []
        }
      ];
      setJobs(mockJobs);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.department && job.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (departmentFilter && departmentFilter !== 'all') {
      filtered = filtered.filter(job => job.department === departmentFilter);
    }

    if (locationFilter && locationFilter !== 'all') {
      filtered = filtered.filter(job => job.location === locationFilter);
    }

    setFilteredJobs(filtered);
  };

  const getUniqueDepartments = () => {
    const departments = jobs.map(job => job.department).filter(Boolean);
    return [...new Set(departments)];
  };

  const getUniqueLocations = () => {
    const locations = jobs.map(job => job.location).filter(Boolean);
    return [...new Set(locations)];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-12 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
          <p className="text-gray-600 mt-2">Manage all your job postings and track applications</p>
        </div>
        <Link href="/jobs/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Post New Job
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {getUniqueDepartments().map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {getUniqueLocations().map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="text-sm text-gray-500 flex items-center justify-center">
              {filteredJobs.length} of {jobs.length} jobs
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-500 mb-4">
              {jobs.length === 0 
                ? "You haven't posted any jobs yet. Get started by creating your first job posting."
                : "No jobs match your current filters. Try adjusting your search criteria."
              }
            </p>
            {jobs.length === 0 && (
              <Link href="/jobs/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Post Your First Job
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {job.candidates?.length || 0} candidates
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                      {job.department && (
                        <span className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {job.department}
                        </span>
                      )}
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Posted {formatDate(job.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                                     <div className="flex items-center gap-2">
                     <Link href={`/candidates/new?jobId=${job.id}`}>
                       <Button size="sm">
                         <Plus className="w-4 h-4 mr-2" />
                         Add Candidate
                       </Button>
                     </Link>
                     <Link href={`/jobs/${job.id}`}>
                       <Button variant="outline" size="sm">
                         <Eye className="w-4 h-4 mr-2" />
                         View
                       </Button>
                     </Link>
                     <Link href={`/jobs/${job.id}/edit`}>
                       <Button variant="outline" size="sm">
                         <Edit className="w-4 h-4 mr-2" />
                         Edit
                       </Button>
                     </Link>
                     <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                       <Trash2 className="w-4 h-4 mr-2" />
                       Delete
                     </Button>
                   </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
