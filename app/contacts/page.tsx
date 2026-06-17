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
  Button,
  Card,
  CardContent,
} from '@/components/ui';
import * as ContactsAction from '@/components/ContactsActions';
import Image from 'next/image';
import { getDelayClass } from '@/utils';

const instagramIcon = '/assets/img/icons/instagram.svg';
const linkedinIcon = '/assets/img/icons/linkedin.svg';
const githubIcon = '/assets/img/icons/github.svg';

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

      if (error) throw error;

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

  const sortedMembers = [...teamMembers].sort((a, b) => {
    const roleA = a.role.toLowerCase();
    const roleB = b.role.toLowerCase();

    const isPresidentA = roleA.includes('president');
    const isPresidentB = roleB.includes('president');
    const isVpA = roleA.includes('vp');
    const isVpB = roleB.includes('vp');
    const isJrA = roleA.includes('jr');
    const isJrB = roleB.includes('jr');

    if (isPresidentA && !isPresidentB) return -1;
    if (!isPresidentA && isPresidentB) return 1;
    if (isVpA && !isVpB) return -1;
    if (!isVpA && isVpB) return 1;
    if (isVpA && isVpB) return a.full_name.localeCompare(b.full_name);
    if (isJrA && !isJrB) return 1;
    if (!isJrA && isJrB) return -1;
    if (isJrA && isJrB) return a.full_name.localeCompare(b.full_name);
    return 0;
  });

  return (
    <div className='animate-fade-in overflow-x-hidden'>
      <section
        className='min-h-screen pb-12 pt-28'
        style={{
          background: `var(--bg-dotted-${theme === 'dark' ? 'dark' : 'light'})`,
        }}
      >
        <div className='container mx-auto px-4 pt-10'>
          {/* Section header */}
          <div className='fade-in-from-bottom mb-10 text-center'>
            <p
              className='mb-1 text-xs font-semibold uppercase tracking-[0.2em]
                text-muted-foreground'
            >
              Our Team
            </p>
            <h2 className='text-3xl font-bold md:text-5xl'>Meet KDT</h2>
            <p className='mt-3 text-muted-foreground'>
              Here&apos;s our amazing team that makes everything impossible possible!
            </p>
          </div>

          {/* Admin — add member */}
          {user && (
            <div className='fade-in-from-bottom mb-6 flex justify-center'>
              <ContactsAction.AddEditMemberDialog
                mode='add'
                onMemberSaved={fetchTeamMembers}
              />
            </div>
          )}

          {/* Grid */}
          {isLoading ? (
            <div className='flex min-h-[200px] items-center justify-center'>
              <Loader2 className='size-10 animate-spin text-muted-foreground' />
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
              {sortedMembers.map((member, index) => (
                <Card
                  key={member.id}
                  className={`fade-in-from-bottom ${getDelayClass(index)} relative`}
                >
                  {user && (
                    <div className='absolute right-2 top-2 z-10 flex gap-1.5'>
                      <ContactsAction.AddEditMemberDialog
                        mode='edit'
                        member={member}
                        onMemberSaved={fetchTeamMembers}
                        trigger={
                          <Button
                            className='size-8 p-0'
                            variant='secondary'
                            size='sm'
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Edit />
                          </Button>
                        }
                      />
                      <ContactsAction.DeleteMemberDialog
                        member={member}
                        onMemberDeleted={fetchTeamMembers}
                      />
                    </div>
                  )}

                  <CardContent className='flex items-start gap-4 p-5'>
                    <Avatar className='size-16 shrink-0'>
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

                    <div className='flex min-w-0 flex-1 flex-col gap-1'>
                      <div className='flex items-start justify-between gap-2'>
                        <h3 className='text-lg font-bold leading-tight'>
                          {member.full_name}
                        </h3>
                        <MemberSocialLinks member={member} />
                      </div>

                      <Badge variant={getBadgeVariant(member.role)} className='w-fit'>
                        {member.role}
                      </Badge>

                      {member.bio && (
                        <p className='mt-1 text-sm leading-relaxed text-muted-foreground'>
                          {member.bio}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
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
    <div className='flex shrink-0 gap-1'>
      {member.instagram_url && (
        <a href={member.instagram_url} target='_blank' rel='noopener noreferrer'>
          <Button size='icon' variant='outline' className='rounded-full'>
            <Image
              src={instagramIcon}
              alt='Instagram'
              width={16}
              height={16}
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
              width={16}
              height={16}
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
              width={16}
              height={16}
              className='invert-100 not-dark:invert-0'
            />
          </Button>
        </a>
      )}
    </div>
  );
}
