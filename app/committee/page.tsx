'use client';
import { useCallback, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useAuth, useToast } from '@/hooks';
import { FallbackCommittee } from '@/lib/data/';
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
import * as CommitteeAction from '@/components/CommitteeActions';
import Image from 'next/image';
import { getDelayClass } from '@/utils';
import { Text } from '@/components/Text';

const instagramIcon = '/assets/img/icons/instagram.svg';
const linkedinIcon = '/assets/img/icons/linkedin.svg';
const githubIcon = '/assets/img/icons/github.svg';

function getInitials(fullName: string) {
  const names = fullName.split(' ');
  return names.length >= 2 ? `${names[0][0]}${names[1][0]}` : names[0][0];
}

function MemberAvatar({ member }: { member: TeamMember }) {
  // Anything set by an admin wins; the Instagram columns are a cache filled by
  // scripts/scrape-instagram.mjs and are blank for private accounts.
  const src = member.profile_image_url || member.instagram_avatar_url || undefined;

  // 96px: Instagram only serves 150px avatars to logged-out clients, so a
  // larger frame renders visibly soft on high-density displays.
  return (
    <Avatar className='size-24 shrink-0'>
      <AvatarImage src={src} alt={member.full_name} />
      <AvatarFallback>{getInitials(member.full_name)}</AvatarFallback>
    </Avatar>
  );
}

export default function Committee() {
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
        setTeamMembers(FallbackCommittee);
      }
    } catch (error) {
      toast.error('Failed to load team members. Using default data.');
      setTeamMembers(FallbackCommittee);
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
            <Text
              variant='caption'
              size='xs'
              className='mb-1 font-semibold uppercase tracking-[0.2em]'
            >
              Our Team
            </Text>
            <Text variant='hd-xl'>Meet KDT</Text>
            <Text variant='muted' className='mt-3'>
              Here&apos;s our amazing team that makes everything impossible possible!
            </Text>
          </div>

          {/* Admin — add member */}
          {user && (
            <div className='fade-in-from-bottom mb-6 flex justify-center'>
              <CommitteeAction.AddEditMemberDialog
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
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-4'>
              {sortedMembers.map((member, index) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  index={index}
                  isAdmin={!!user}
                  onMemberSaved={fetchTeamMembers}
                  onMemberDeleted={fetchTeamMembers}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function MemberCard({
  member,
  index,
  isAdmin,
  onMemberSaved,
  onMemberDeleted,
}: {
  member: TeamMember;
  index: number;
  isAdmin: boolean;
  onMemberSaved: () => void;
  onMemberDeleted: () => void;
}) {
  const displayBio = member.bio || member.instagram_bio;

  return (
    <Card
      key={member.id}
      className={`fade-in-from-bottom ${getDelayClass(index)} relative`}
    >
      {isAdmin && (
        <div className='absolute right-2 top-2 z-10 flex gap-1.5'>
          <CommitteeAction.AddEditMemberDialog
            mode='edit'
            member={member}
            onMemberSaved={onMemberSaved}
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
          <CommitteeAction.DeleteMemberDialog
            member={member}
            onMemberDeleted={onMemberDeleted}
          />
        </div>
      )}

      <CardContent className='flex flex-col items-center gap-3 p-6 text-center'>
        <MemberAvatar member={member} />

        <div className='flex min-w-0 flex-col items-center gap-1'>
          <Text variant='hd-lg' className='leading-tight'>
            {member.full_name}
          </Text>

          <Badge variant={getBadgeVariant(member.role)} className='w-fit'>
            {member.role}
          </Badge>
          <MemberSocialLinks member={member} />
          {displayBio && (
            <Text
              variant='muted'
              size='sm'
              className='mt-1 leading-relaxed whitespace-pre-line'
            >
              {displayBio}
            </Text>
          )}
        </div>
      </CardContent>
    </Card>
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
    <div className='mt-1 flex shrink-0 gap-1'>
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
