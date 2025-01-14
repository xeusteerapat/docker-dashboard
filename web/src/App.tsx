import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Play, Square, Box, HardDrive, Image as ImageIcon } from 'lucide-react';
import { dockerApi } from './libs/api-client';
import { useToast } from '@/hooks/use-toast';

type SidebarItem = 'containers' | 'images' | 'volumes';

const DockerDashboard = () => {
  const [selectedItem, setSelectedItem] = useState<SidebarItem>('containers');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const containersQuery = useQuery({
    queryKey: ['containers'],
    queryFn: () => dockerApi.containers.list(),
  });

  const imagesQuery = useQuery({
    queryKey: ['images'],
    queryFn: () => dockerApi.images.list(),
    enabled: selectedItem === 'images',
  });

  const volumesQuery = useQuery({
    queryKey: ['volumes'],
    queryFn: () => dockerApi.volumes.list(),
    enabled: selectedItem === 'volumes',
  });

  // Mutations
  const startContainerMutation = useMutation({
    mutationFn: dockerApi.containers.start,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['containers'] });
      toast({
        title: 'Success',
        description: 'Container started successfully',
      });
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to start container',
        variant: 'destructive',
      });
    },
  });

  const stopContainerMutation = useMutation({
    mutationFn: dockerApi.containers.stop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['containers'] });
      toast({
        title: 'Success',
        description: 'Container stopped successfully',
      });
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to stop container',
        variant: 'destructive',
      });
    },
  });

  return (
    <div className='flex h-screen bg-gray-100'>
      {/* Sidebar */}
      <div className='w-64 bg-white shadow-md'>
        <div className='p-4'>
          <h2 className='text-xl font-bold text-gray-800'>Docker Resources</h2>
        </div>
        <nav className='mt-4'>
          <button
            onClick={() => setSelectedItem('containers')}
            className={`flex items-center w-full px-4 py-2 text-left ${
              selectedItem === 'containers'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Box className='mr-2 h-5 w-5' />
            Containers
          </button>
          <button
            onClick={() => setSelectedItem('images')}
            className={`flex items-center w-full px-4 py-2 text-left ${
              selectedItem === 'images'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ImageIcon className='mr-2 h-5 w-5' />
            Images
          </button>
          <button
            onClick={() => setSelectedItem('volumes')}
            className={`flex items-center w-full px-4 py-2 text-left ${
              selectedItem === 'volumes'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <HardDrive className='mr-2 h-5 w-5' />
            Volumes
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className='flex-1 p-8'>
        <Card>
          <CardContent className='p-6'>
            {selectedItem === 'containers' && (
              <>
                <h2 className='text-2xl font-bold mb-4'>Containers</h2>
                {containersQuery.isLoading ? (
                  <div className='flex items-center justify-center h-32'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900' />
                  </div>
                ) : containersQuery.error ? (
                  <div className='text-red-500'>
                    Error: {containersQuery.error.message}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Image</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Port(s)</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {containersQuery.data?.map((container) => (
                        <TableRow key={container.id}>
                          <TableCell>{container.name}</TableCell>
                          <TableCell>{container.image}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                container.status === 'running'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {container.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {container.ports.map((port, index) => (
                              <span
                                key={`${container.id}-${port}-${index}`}
                                className='inline-block bg-gray-100 rounded px-2 py-1 text-sm mr-2'
                              >
                                {port}
                              </span>
                            ))}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => {
                                if (container.status === 'running') {
                                  stopContainerMutation.mutate(container.id);
                                } else {
                                  startContainerMutation.mutate(container.id);
                                }
                              }}
                              disabled={
                                startContainerMutation.isPending ||
                                stopContainerMutation.isPending
                              }
                              className={
                                container.status === 'running'
                                  ? 'text-red-600'
                                  : 'text-green-600'
                              }
                            >
                              {container.status === 'running' ? (
                                <Square className='h-4 w-4' />
                              ) : (
                                <Play className='h-4 w-4' />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </>
            )}
            {selectedItem === 'images' && (
              <>
                <h2 className='text-2xl font-bold mb-4'>Images</h2>
                {imagesQuery.isLoading ? (
                  <div className='flex items-center justify-center h-32'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900' />
                  </div>
                ) : imagesQuery.error ? (
                  <div className='text-red-500'>
                    Error: {imagesQuery.error.message}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Repository</TableHead>
                        <TableHead>Tag</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {imagesQuery.data?.map((image) => (
                        <TableRow key={image.id}>
                          <TableCell>{image.repository}</TableCell>
                          <TableCell>
                            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                              {image.tag}
                            </span>
                          </TableCell>
                          <TableCell className='font-mono text-sm'>
                            {image.id.slice(0, 12)}
                          </TableCell>
                          <TableCell>{image.size}</TableCell>
                          <TableCell>
                            {new Date(image.created).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </>
            )}
            {selectedItem === 'volumes' && (
              <>
                <h2 className='text-2xl font-bold mb-4'>Volumes</h2>
                {volumesQuery.isLoading ? (
                  <div className='flex items-center justify-center h-32'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900' />
                  </div>
                ) : volumesQuery.error ? (
                  <div className='text-red-500'>
                    Error: {volumesQuery.error.message}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Used By</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {volumesQuery.data?.map((volume) => (
                        <TableRow key={volume.id}>
                          <TableCell className='font-medium'>
                            {volume.name}
                          </TableCell>
                          <TableCell>{volume.driver}</TableCell>
                          <TableCell>{volume.size}</TableCell>
                          <TableCell>
                            {volume.usedBy.length === 0 ? (
                              <span className='text-gray-400'>Not in use</span>
                            ) : (
                              <div className='space-y-1'>
                                {volume.usedBy.map((container) => (
                                  <div
                                    key={container.id}
                                    className='flex items-center space-x-2'
                                  >
                                    <span
                                      className={`w-2 h-2 rounded-full ${
                                        container.state === 'running'
                                          ? 'bg-green-500'
                                          : 'bg-gray-500'
                                      }`}
                                    />
                                    <span className='text-sm'>
                                      {container.name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(volume.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DockerDashboard;
