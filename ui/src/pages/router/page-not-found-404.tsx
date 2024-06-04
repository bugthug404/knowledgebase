import { Link } from 'react-router-dom';

export const NotFoundPage404 = (props: { backlink?: boolean }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full select-none">
      <div className="text-[8vw] flex items-center font-bold">
        <div className='text-[60px] font-extrabold'>404</div>
      </div>
      <div
        className={`${props.backlink ? 'flex' : 'hidden'
          } items-center justify-center select-none flex-col`}
      >
        <p>Seems like you lost your way </p>
        <Link
          to={'/'}
          className="px-3 mt-2 border border-b-4 rounded-lg shadow-md active:border-b-2 shadow-white/25"
        >
          Let's go home
        </Link>
      </div>
    </div>
  );
};
