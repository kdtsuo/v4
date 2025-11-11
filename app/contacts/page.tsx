'use client';
import { useCallback, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useAuth, useToast } from '@/hooks';
import { FallbackContacts } from '@/lib/data/';
import { supabase } from '@/lib';
import type { TeamMember } from '@/types';
import { Edit, Loader2 } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
} from '@/components/ui';
import * as ContactsAction from '@/components/ContactsActions';

import Image from 'next/image';

const instagramIcon = '/assets/img/icons/instagram.svg';
const linkedinIcon = '/assets/img/icons/linkedin.svg';
const githubIcon = '/assets/img/icons/github.svg';

import { getDelayClass } from '@/utils';

export default function Contacts() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const fetchTeamMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('is_archived', false)
        .order('order_index', { ascending: true });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setTeamMembers(data);
      } else {
        setTeamMembers(FallbackContacts);
      }
    } catch (error) {
      toast.error('Failed to load team members. Using default data.');
      setTeamMembers(FallbackContacts);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  // Sort team members: president(s) first, then VPs alphabetically, then others, then Jrs alphabetically
  const sortedMembers = [...teamMembers].sort((a, b) => {
    const roleA = a.role.toLowerCase();
    const roleB = b.role.toLowerCase();

    const isPresidentA = roleA.includes('president');
    const isPresidentB = roleB.includes('president');
    const isVpA = roleA.includes('vp');
    const isVpB = roleB.includes('vp');
    const isJrA = roleA.includes('jr');
    const isJrB = roleB.includes('jr');

    // President(s) first
    if (isPresidentA && !isPresidentB) return -1;
    if (!isPresidentA && isPresidentB) return 1;

    // VPs next, sorted alphabetically
    if (isVpA && !isVpB) return -1;
    if (!isVpA && isVpB) return 1;
    if (isVpA && isVpB) {
      return a.full_name.localeCompare(b.full_name);
    }

    // Jrs last, sorted alphabetically
    if (isJrA && !isJrB) return 1;
    if (!isJrA && isJrB) return -1;
    if (isJrA && isJrB) {
      return a.full_name.localeCompare(b.full_name);
    }

    // Others in the middle, keep original order
    return 0;
  });

  return (
    <>
      <div
        className='animate-fade-in pt-36 pb-12 min-h-screen'
        style={{
          background: `var(--bg-dotted-${theme === 'dark' ? 'dark' : 'light'})`,
        }}
      >
        <Card className='sm:mx-auto max-w-6xl mx-4 fade-in-from-top'>
          <CardHeader>
            <div className='flex justify-between items-center'>
              <div className='flex-1'>
                <CardTitle className='text-3xl text-center'>Meet KDT</CardTitle>
                <CardDescription className='text-center'>
                  Here&apos;s our amazing team that makes everything impossible possible!
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {user && (
              <div className='w-full flex justify-center mb-4'>
                <ContactsAction.AddEditMemberDialog
                  mode='add'
                  onMemberSaved={fetchTeamMembers}
                />
              </div>
            )}
            {isLoading ? (
              <div className='flex min-h-[200px] items-center justify-center pb-[1000px]'>
                <Loader2 className='size-10 animate-spin text-muted-foreground' />
              </div>
            ) : (
              <div className='flex flex-wrap justify-center gap-6 fade-in-from-top'>
                {sortedMembers.map((member, index) => (
                  <Card
                    key={member.id}
                    className={`w-full max-w-xs relative fade-in-from-top
                      ${getDelayClass(index)}`}
                  >
                    {user && (
                      <div className='absolute top-2 right-2 z-20 flex gap-2'>
                        <ContactsAction.AddEditMemberDialog
                          mode='edit'
                          member={member}
                          onMemberSaved={fetchTeamMembers}
                          trigger={
                            <Button
                              className='h-8 w-8 p-0'
                              variant='secondary'
                              size='sm'
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Edit size={16} />
                            </Button>
                          }
                        />
                        <ContactsAction.DeleteMemberDialog
                          member={member}
                          onMemberDeleted={fetchTeamMembers}
                        />
                      </div>
                    )}
                    <CardHeader className='flex flex-col items-center'>
                      <Avatar className='size-20'>
                        <AvatarImage
                          src={member.profile_image_url}
                          alt={member.full_name}
                        />
                        <AvatarFallback>
                          {(() => {
                            const names = member.full_name.split(' ');
                            return names.length >= 2
                              ? `${names[0][0]}${names[1][0]}`
                              : names[0][0];
                          })()}
                        </AvatarFallback>
                      </Avatar>
                      <CardTitle className='text-center'>{member.full_name}</CardTitle>
                      <Badge variant={getBadgeVariant(member.role)} className=''>
                        {member.role}
                      </Badge>
                      <MemberSocialLinks member={member} />
                    </CardHeader>
                    <CardContent>
                      <CardDescription className='text-center'>
                        {member.bio}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function getBadgeVariant(role: string) {
  const lowerRole = role.toLowerCase();
  if (lowerRole.includes('president')) return 'gold';
  if (lowerRole.includes('vp')) return 'platinum';
  if (lowerRole.includes('web developer')) return 'secondary';
  if (lowerRole.includes('jr')) return 'green';
  return 'default';
}

function MemberSocialLinks({ member }: { member: TeamMember }) {
  return (
    <div className='flex justify-center gap-2'>
      {member.instagram_url && (
        <a href={member.instagram_url} target='_blank' rel='noopener noreferrer'>
          <Button size='icon' variant='outline' className='rounded-full'>
            <Image
              src={instagramIcon}
              alt='Instagram'
              width={20}
              height={20}
              className='invert-100 not-dark:invert-0'
            />
          </Button>
        </a>
      )}
      {member.linkedin_url && (
        <a href={member.linkedin_url} target='_blank' rel='noopener noreferrer'>
          <Button size='icon' variant='outline' className='rounded-full'>
            <Image
              src={linkedinIcon}
              alt='LinkedIn'
              width={20}
              height={20}
              className='invert-100 not-dark:invert-0'
            />
          </Button>
        </a>
      )}
      {member.github_url && (
        <a href={member.github_url} target='_blank' rel='noopener noreferrer'>
          <Button size='icon' variant='outline' className='rounded-full'>
            <Image
              src={githubIcon}
              alt='GitHub'
              width={20}
              height={20}
              className='invert-100 not-dark:invert-0'
            />
          </Button>
        </a>
      )}
    </div>
  );
}
