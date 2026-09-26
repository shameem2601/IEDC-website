import React, {useState, useRef} from 'react'
import {Card, Stack, Text, Heading, Button, Box, Flex, Spinner, Badge, Grid} from '@sanity/ui'
import {useClient} from 'sanity'

export function BulkMemberTool() {
  const client = useClient({apiVersion: '2024-03-01'})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState<{current: number; total: number; name: string} | null>(null)
  const [createdMembers, setCreatedMembers] = useState<{id: string; name: string; photoUrl?: string}[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const selected = Array.from(e.target.files)
    setFiles(selected)
    setErrorMsg(null)
  }

  const handleUploadAndCreate = async () => {
    if (files.length === 0) return
    setIsUploading(true)
    setErrorMsg(null)
    const created: {id: string; name: string; photoUrl?: string}[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Clean name guess from filename (e.g. "rahul_sharma.jpg" -> "Rahul Sharma")
        let nameGuess = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_.]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()

        // If filename is camera/phone timestamp e.g. "IMG 2024...", "WhatsApp...", numbers
        if (/^(img|dsc|pxl|whatsapp|screenshot|\d+)/i.test(nameGuess) || nameGuess.length < 2) {
          nameGuess = `Student ${i + 1}`
        } else {
          nameGuess = nameGuess.replace(/\b\w/g, (c) => c.toUpperCase())
        }

        const initials = nameGuess
          .split(' ')
          .filter(Boolean)
          .map((p) => p[0])
          .join('')
          .slice(0, 2)
          .toUpperCase() || 'ST'

        setProgress({current: i + 1, total: files.length, name: nameGuess})

        // 1. Upload photo asset to Sanity
        const asset = await client.assets.upload('image', file, {
          filename: file.name,
        })

        // 2. Create the teamMember document in Sanity
        const doc = await client.create({
          _type: 'teamMember',
          name: nameGuess,
          initials: initials,
          role: 'Member',
          hierarchy: 'member',
          badgeIcon: 'person',
          photo: {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: asset._id,
            },
          },
          order: 10 + i,
        })

        created.push({
          id: doc._id,
          name: nameGuess,
          photoUrl: asset.url,
        })
      }

      setCreatedMembers(created)
      setFiles([])
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err: any) {
      console.error('Bulk upload error:', err)
      setErrorMsg(err.message || 'Failed to complete bulk upload')
    } finally {
      setIsUploading(false)
      setProgress(null)
    }
  }

  return (
    <Box padding={[4, 5, 6]} style={{maxWidth: 880, margin: '0 auto'}}>
      <Stack space={5}>
        {/* Title Header */}
        <Card padding={4} radius={2} tone="primary" border>
          <Stack space={3}>
            <Flex align="center" gap={3}>
              <Text size={4}>👥</Text>
              <Heading as="h1" size={3}>
                Bulk Member Creator
              </Heading>
            </Flex>
            <Text size={1} muted>
              Upload 8 to 30+ student photos at once. A full member profile is automatically created in
              Sanity with their photo attached. You can then edit their names, roles, social links, and
              tier hierarchy in the <strong>Team Members</strong> section anytime!
            </Text>
          </Stack>
        </Card>

        {/* Upload Zone */}
        <Card padding={5} radius={2} border style={{textAlign: 'center', background: '#fafaf9'}}>
          <Stack space={4} align="center">
            <Text size={3}>📸</Text>
            <Heading as="h2" size={2}>
              Select Student Photos
            </Heading>
            <Text size={1} muted>
              Select multiple headshot photos from your computer (JPG, PNG, WEBP)
            </Text>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFilesSelected}
              disabled={isUploading}
              style={{display: 'none'}}
              id="bulk-member-file-input"
            />

            <Button
              text={files.length > 0 ? `Selected ${files.length} Photos` : 'Choose Photos (Bulk)'}
              tone="primary"
              fontSize={2}
              padding={3}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              style={{cursor: 'pointer'}}
            />

            {files.length > 0 && !isUploading && (
              <Stack space={3} align="center" style={{marginTop: 12}}>
                <Badge tone="positive" fontSize={1} padding={2}>
                  Ready: {files.length} student photos queued
                </Badge>
                <Button
                  text={`Upload & Create ${files.length} Member Profiles`}
                  tone="positive"
                  fontSize={2}
                  padding={3}
                  onClick={handleUploadAndCreate}
                  style={{cursor: 'pointer'}}
                />
              </Stack>
            )}
          </Stack>
        </Card>

        {/* Progress Display */}
        {isUploading && progress && (
          <Card padding={4} radius={2} tone="caution" border>
            <Flex align="center" gap={3}>
              <Spinner />
              <Stack space={2}>
                <Text weight="semibold" size={2}>
                  Uploading &amp; creating profiles...
                </Text>
                <Text size={1} muted>
                  Photo {progress.current} of {progress.total}: <strong>{progress.name}</strong>
                </Text>
              </Stack>
            </Flex>
          </Card>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <Card padding={3} radius={2} tone="critical" border>
            <Text size={1} weight="semibold">
              Error: {errorMsg}
            </Text>
          </Card>
        )}

        {/* Success Confirmation */}
        {createdMembers.length > 0 && (
          <Card padding={4} radius={2} tone="positive" border>
            <Stack space={4}>
              <Flex align="center" gap={2}>
                <Text size={3}>🎉</Text>
                <Heading as="h3" size={2}>
                  Successfully Created {createdMembers.length} Student Profiles!
                </Heading>
              </Flex>
              <Text size={1}>
                Every photo has been uploaded and linked to its own profile in Sanity. You can now click
                <strong> Team Members</strong> in the left sidebar to add their names, roles, LinkedIn,
                Instagram, and assign their tier (Faculty, Executive, or Member).
              </Text>

              <Grid columns={[2, 3, 4]} gap={3} style={{marginTop: 8}}>
                {createdMembers.slice(0, 12).map((m) => (
                  <Card key={m.id} padding={2} radius={2} border style={{background: 'white'}}>
                    <Flex align="center" gap={2}>
                      {m.photoUrl && (
                        <img
                          src={m.photoUrl}
                          alt={m.name}
                          style={{width: 36, height: 36, objectFit: 'cover', borderRadius: 4}}
                        />
                      )}
                      <Text size={1} weight="semibold" textOverflow="ellipsis">
                        {m.name}
                      </Text>
                    </Flex>
                  </Card>
                ))}
              </Grid>
              {createdMembers.length > 12 && (
                <Text size={1} muted>
                  + {createdMembers.length - 12} more members created
                </Text>
              )}
            </Stack>
          </Card>
        )}
      </Stack>
    </Box>
  )
}
