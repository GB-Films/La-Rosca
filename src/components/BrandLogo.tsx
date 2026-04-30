interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClass = {
  sm: 'h-10 w-10',
  md: 'h-14 w-14',
  lg: 'h-24 w-24',
};

export const BrandLogo = ({ size = 'md' }: BrandLogoProps) => (
  <div className={`${sizeClass[size]} rosca-logo`} aria-label="Logo de La Rosca" role="img">
    <span className="rosca-logo__hole" />
    <span className="rosca-logo__fruit rosca-logo__fruit--one" />
    <span className="rosca-logo__fruit rosca-logo__fruit--two" />
    <span className="rosca-logo__fruit rosca-logo__fruit--three" />
    <span className="rosca-logo__sugar rosca-logo__sugar--one" />
    <span className="rosca-logo__sugar rosca-logo__sugar--two" />
  </div>
);
